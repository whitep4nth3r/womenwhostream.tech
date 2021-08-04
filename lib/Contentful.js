import { createClient } from "contentful-management";
export default class Contentful {
  static async getTags() {
    const query = `{
    tagCollection(order: name_ASC) {
      total
      items {
        name
        slug
      }
    }
  }`;

    const tags = await this.call(query);
    return tags.data.tagCollection.items;
  }

  static async getTagBySlug(slug) {
    const query = `{
      tagCollection(limit: 1, where: {slug: "${slug}"}) {
        items {
          name
          slug
        }
      }
    }`;

    const tags = await this.call(query);
    return tags.data.tagCollection.items[0];
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

  static async updateStreamerByTwitchUsername(
    username,
    twitchData,
    streamData,
    vodData,
    tagData
  ) {
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
  static async updateStreamerById(
    id,
    twitchData,
    streamData,
    vodData,
    tagData
  ) {
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
        entry.fields.streamData["en-US"] =
          entry.fields.streamData["en-US"] || {};
        if (this.isEmptyObject(streamData)) {
          entry.fields.streamData["en-US"].type = "";
          console.log("Streamer Offline");
        } else {
          entry.fields.streamData["en-US"] = streamData || {};
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
        console.log(
          `Entry ${entry.sys.id} - ${entry.fields.twitchUsername["en-US"]} updated.`
        )
      )
      .catch(console.error);
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
      const data = await fetch(fetchUrl, fetchOptions).then((response) =>
        response.json()
      );
      return data;
    } catch (error) {
      throw new Error("Could not fetch data from Contentful!");
    }
  }

  static isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }
}
