const dotenv = require("dotenv");
const fetch = require("node-fetch");
const jsonDiff = require("json-diff");

async function waitFor(seconds) {
  return await new Promise((res) => setTimeout(res, seconds * 1000));
}

function sortStreamers(a, b) {
  if (a.streamData !== null && b.streamData !== null) {
    // if both live, highest viewers first
    return b.streamData.viewer_count - a.streamData.viewer_count;
  } else if (a.streamData !== null && b.streamData === null) {
    // if a live
    return -1;
  } else if (b.streamData !== null && a.streamData === null) {
    // if b live
    return 1;
  } else if (a.vodData !== null && b.vodData !== null) {
    // order by most recently published VOD
    const a_timestamp = Date.parse(a.vodData.published_at);
    const a_date = new Date(a_timestamp);

    const b_timestamp = Date.parse(b.vodData.published_at);
    const b_date = new Date(b_timestamp);

    return b_date - a_date;
  } else {
    return 0;
  }
}

function getTwitchFetchOptions(accessToken) {
  return {
    headers: {
      "Client-Id": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

async function callTwitch(url, accessToken) {
  try {
    let response;

    while (true) {
      response = await fetch(url, getTwitchFetchOptions(accessToken));

      if (response.status !== 429) {
        break;
      }

      // temporarily back off the API when rate limiting response is returned
      const refreshWhen = parseInt(response.headers.get("Ratelimit-Reset"));
      const timeToWait = refreshWhen - Math.floor(Date.now() / 1000);
      console.warn(`🚨 Rate limited for ${timeToWait} seconds`);
      await waitFor(timeToWait);
    }

    const responseJson = await response.json();
    return responseJson.data;
  } catch (error) {
    console.log(error);
  }
}

async function callContentful(query) {
  const fetchUrl = `https://graphql.contentful.com/content/v1/spaces/${process.env.CTFL_SPACE_ID}`;

  console.info({
    SPACE_ID_EXISTS: !!process.env.CTFL_SPACE_ID,
    TOKEN_EXISTS: !!process.env.CTFL_ACCESS_TOKEN
  });

  const fetchOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CTFL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  };

  try {
    const data = await fetch(fetchUrl, fetchOptions).then((response) => response.json());
    console.info('data from Contentful', data);
    return data;
  } catch (error) {
    throw new Error("Could not fetch data from Contentful!");
  }
}

async function getTwitchAccessToken() {
  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials&scope=user_read`,
      {
        method: "POST",
        headers: { accept: "application/vnd.twitchtv.v5+json" },
      },
    );

    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.log(error);
  }
}

async function getTwitchUsersbyLogin(usernames, accessToken) {
  console.log("⚡️ Getting Twitch Users by Login");
  if (usernames.length >= 99) {
    throw "Number of users is >= 99! YOU NEED TO SCALE TwitchAPI.getUsersbyLogin()!";
  }

  const usersString = usernames.join("&login=");

  // right now, we have 59 streamers
  // limit is 100
  // TODO: paginate this
  const users = await callTwitch(
    `https://api.twitch.tv/helix/users?login=${usersString}`,
    accessToken,
  );

  return users;
}

async function getTwitchVodDataById(twitchId, accessToken) {
  console.log("📹 Getting Twitch Vod Data by twitchId");
  const vod = await callTwitch(
    `https://api.twitch.tv/helix/videos?user_id=${twitchId}&first=1`,
    accessToken,
  );

  return vod && vod.length === 1 ? vod[0] : null;
}

async function getTwitchStreamDataByLogin(twitchUsername, accessToken) {
  console.log("📣 Getting Twitch Stream Data by Login");
  const stream = await callTwitch(
    `https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`,
    accessToken,
  );

  return stream && stream.length === 1 ? stream[0] : null;
}

async function mergeStreamersWithTwitchData(streamers) {
  console.log("💰 Merging Contentful data with Twitch Data");

  const accessToken = await getTwitchAccessToken();
  const userNames = streamers.map((streamer) => streamer.twitchUsername);
  const allUserData = await getTwitchUsersbyLogin(userNames, accessToken.access_token);

  const mergedStreamers = streamers.map((streamer) => {
    const twitchData = allUserData.find(
      (entry) => entry.login === streamer.twitchUsername.toLowerCase(),
    );
    return {
      ...streamer,
      twitchData,
    };
  });

  const composedData = [];

  // load streamers in serial rather than parallel to avoid overhwhelming the API
  for (let streamer of mergedStreamers) {
    console.log("✨ Loading Twitch data for streamers in some kind of loop");
    const vodData = await getTwitchVodDataById(streamer.twitchData.id, accessToken.access_token);
    const streamData = await getTwitchStreamDataByLogin(
      streamer.twitchUsername,
      accessToken.access_token,
    );

    composedData.push({
      ...streamer,
      streamData,
      vodData,
    });
  }

  return composedData;
}

async function getAllStreamers() {
  console.log("🔥 Running getAllStreamers()");

  const query = `{
streamerCollection(order: sys_firstPublishedAt_ASC) {
  items {
    sys {
      id
    }
    githubUsername
    twitchUsername
    twitterUsername
    youtubeChannelId
    websiteUrl
    location
    tagsCollection {
      items {
        sys {
          id
        }
        name
        slug
      }
    }
  }
}
}`;

  try {
    const streamers = await callContentful(query);
    console.info({ streamers });
    const mergedData = await mergeStreamersWithTwitchData(streamers.data.streamerCollection.items);

    mergedData.sort(sortStreamers);

    return mergedData;
  } catch (error) {
    console.log(error);
  }
}

(async function () {
  console.log("🎱 Welcome to build-data!");
  dotenv.config();

  try {
    console.log("👀 Pulling current streamers JSON from Contentful");

    const currentJson = `https://api.contentful.com/spaces/${process.env.CTFL_JSON_SPACE_ID}/environments/main/entries/${process.env.CTFL_JSON_ENTRY_ID}`;
    const updateJson = currentJson;
    const publishJson = `https://api.contentful.com/spaces/${process.env.CTFL_JSON_SPACE_ID}/environments/main/entries/${process.env.CTFL_JSON_ENTRY_ID}/published`;
    let lastVersion = 0;

    const currentData = await fetch(currentJson,
      {
        headers: {
          Authorization: `Bearer ${process.env.CTFL_JSON_UPDATE_TOKEN}`
        },
      })
      .then(r => r.json())
      .then(d => {
        lastVersion = d.sys.version;

        return d.fields.data["en-US"];
      });

    const newData = await getAllStreamers();

    if (jsonDiff.diff(currentData, newData)) {
      console.log("⏳ Updating Contentful with new JSON data!");
      console.info({ newData });

      await fetch(updateJson,
        {
          body: JSON.stringify({
            fields: {
              data: {
                "en-US": newData,
              },
              title: {
                "en-US": `JSON update ${new Date().toLocaleString()}`,
              },
            },
          }),
          headers: {
            Authorization: `Bearer ${process.env.CTFL_JSON_UPDATE_TOKEN}`,
            "Content-Type": "application/vnd.contentful.management.v1+json",
            "X-Contentful-Version": lastVersion,
          },
          method: "PUT",
        })
        .then(r => r.json())
        .then(async d => {
          if (d.sys.type === "Error")
            return console.info({ d });

          console.log("👍 Updated. Publishing JSON data on Contentful...");

          await fetch(publishJson, {
            headers: {
              Authorization: `Bearer ${process.env.CTFL_JSON_UPDATE_TOKEN}`,
              "X-Contentful-Version": d.sys.version,
            },
            method: "PUT",
          })
          .then(r => r.json())
          .then(d => {
            if (d.sys.type === "Error")
              return console.info({ d });

            console.log("✅ JSON value updated on Contentful!");
          });
        });

      // console.log("🔥 Calling Vercel webhook!");
      // await fetch(process.env.VERCEL_DEPLOY_GH_ACTION_HOOK, { method: "POST" });
    } else {
      console.log("🔥 No new data to write! Carry on!");
    }
  } catch (error) {
    console.log(error);
  }
})();
