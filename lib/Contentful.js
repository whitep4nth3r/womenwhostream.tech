import { createClient } from "contentful-management";

export default class Contentful {
  static async getAllStreamers() {
    const query = `{
      streamerCollection {
        total
        items {
          sys {
            id
          }
          twitchUsername
          githubUsername
          youtubeChannelId
          twitterUsername
          websiteUrl
          isLive
          twitchData
          streamData
          vodData
          tagData
        }
      }
    }`;

    const response = await this.call(query);
    return response.data.streamerCollection.items;
  }

  static async getTwitchUserNames() {
    const query = `{
      streamerCollection {
        items {
          twitchUsername
          }
        }
      }`;
    const usernames = await this.call(query);
    return usernames.data.streamerCollection.items.map((item) => {
      return item.twitchUsername;
    });
  }

  static async getTwitchUserName(entryid) {
    const query = `{
      streamerCollection(limit: 1, where: {sys:{id:"${entryid}"}}, preview: true) {
        items {
          twitchUsername
          }
        }
      }`;
    const usernames = await this.call(query);
    return usernames.data.streamerCollection.items[0].twitchUsername;
  }

  static async updateStreamerByTwitchUsername(username, twitchData, streamData, vodData, tagData) {
    const query = `{
      streamerCollection (where: {twitchUsername: "${username}"}) {
        items {
          twitchUsername
          sys {
            id
          }
        }
      }
    }`;
    const streamers = await this.call(query);
    const id = streamers.data.streamerCollection.items[0].sys.id;
    await this.updateStreamerById(id, twitchData, streamData, vodData, tagData);
  }

  static async updateStreamerById(id, twitchData, streamData, vodData, tagData) {
    const client = createClient({
      accessToken: process.env.CTFL_CM_ACCESS_TOKEN,
    });
    await client
      .getSpace(process.env.CTFL_SPACE_ID)
      .then((space) => space.getEnvironment(process.env.CTFL_ENVIRONMENT_ID))
      .then((environment) => environment.getEntry(id))
      .then((entry) => {
        entry.fields.twitchData = {};
        entry.fields.twitchData["en-US"] = twitchData || {};

        entry.fields.streamData = entry.fields.streamData || {};
        entry.fields.streamData["en-US"] = entry.fields.streamData["en-US"] || {};
        entry.fields.isLive = entry.fields.isLive || {};
        entry.fields.isLive["en-US"] = entry.fields.isLive["en-US"] || false;
        if (this.isEmptyObject(streamData)) {
          entry.fields.streamData["en-US"].type = "";
          entry.fields.isLive["en-US"] = false;
          console.log("Streamer Offline");
        } else {
          entry.fields.streamData["en-US"] = streamData || {};
          entry.fields.isLive["en-US"] = true;
          console.log("Streamer Online");
        }

        if (!this.isEmptyObject(vodData)) {
          entry.fields.vodData = {};
          entry.fields.vodData["en-US"] = vodData || {};
        }

        if (!this.isEmptyObject(tagData)) {
          entry.fields.tagData = {};
          entry.fields.tagData["en-US"] = tagData || {};
        }
        return entry.update();
      })
      .then((entry) => entry.publish())
      .then((entry) =>
        console.log(`Entry ${entry.sys.id} - ${entry.fields.twitchUsername["en-US"]} updated.`),
      )
      .catch((error) => {
        console.log(`Error updating contentful: ${error || JSON.stringify(error)}`);
      });
  }

  static async call(query) {
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

  static isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }
}
