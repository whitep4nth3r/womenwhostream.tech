const dotenv = require("dotenv");
const fetch = require("node-fetch");
const fs = require("fs");

let STREAMERS_CACHE = [];

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
      console.warn(`Rate limited for ${timeToWait} seconds`);
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
  console.log("=== Getting Twitch Users by Login ===");
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
  console.log("=== Getting Twitch Vod Data by twitchId ===");
  const vod = await callTwitch(
    `https://api.twitch.tv/helix/videos?user_id=${twitchId}&first=1`,
    accessToken,
  );

  return vod && vod.length === 1 ? vod[0] : null;
}

async function getTwitchStreamDataByLogin(twitchUsername, accessToken) {
  console.log("=== Getting Twitch Stream Data by Login ===");
  const stream = await callTwitch(
    `https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`,
    accessToken,
  );

  return stream && stream.length === 1 ? stream[0] : null;
}

async function mergeStreamersWithTwitchData(streamers) {
  console.log("=== Merging Contentful data with Twitch Data ===");

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
    console.log("=== Loading Twitch data for streamers in parallel ===");
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
  console.log("=== Running getAllStreamers() ===");

  if (STREAMERS_CACHE.length > 0) {
    return STREAMERS_CACHE;
  }

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
    const mergedData = await mergeStreamersWithTwitchData(streamers.data.streamerCollection.items);

    mergedData.sort(sortStreamers);
    STREAMERS_CACHE = mergedData;

    return mergedData;
  } catch (error) {
    console.log(error);
  }
}

(async function () {
  console.log("=== SCRIPT STARTED ===");
  dotenv.config();

  try {
    const streamersData = await getAllStreamers();

    await fs.writeFile(
      "./scripts/data/streamers.json",
      JSON.stringify(streamersData),
      function (err) {
        if (err) return console.log(err);
        console.log("Streamers file written!");
      },
    );
  } catch (error) {
    console.log(error);
  }
})();
