import TwitchApi from "@lib/Twitch";
import { sortStreamers } from "@lib/Utils";

export default class Streamers {
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

    const tags = await this.callContentful(query);
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

    const tags = await this.callContentful(query);
    return tags.data.tagCollection.items[0];
  }

  static async getByTag(tagSlug) {
    const query = `{
    tagCollection(limit: 1, where: {slug: "${tagSlug}"}) {
      items {
        name
        slug
        linkedFrom {
          streamerCollection {
            total
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
        }
      }
    }
  }`;

    try {
      const streamers = await this.callContentful(query);
      const mergedData = await Streamers.mergeStreamersWithTwitchData(
        streamers.data.tagCollection.items[0].linkedFrom.streamerCollection.items,
      );
      mergedData.sort(sortStreamers);
      return mergedData;
    } catch (error) {
      console.log(error);
    }
  }

  static async getAll() {
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
      const streamers = await this.callContentful(query);
      const mergedData = await Streamers.mergeStreamersWithTwitchData(
        streamers.data.streamerCollection.items,
      );

      mergedData.sort(sortStreamers);
      return mergedData;
    } catch (error) {
      console.log(error);
    }
  }

  static async mergeStreamersWithTwitchData(streamers) {
    const accessToken = await TwitchApi.getAccessToken();
    const userNames = streamers.map((streamer) => streamer.twitchUsername);
    const allUserData = await TwitchApi.getUsersbyLogin(userNames, accessToken.access_token);

    const mergedStreamers = streamers.map((streamer) => {
      const twitchData = allUserData.find(
        (entry) => entry.login === streamer.twitchUsername.toLowerCase(),
      );
      return {
        ...streamer,
        twitchData,
      };
    });

    const promises = mergedStreamers.map(async (streamer) => {
      const vodData = await TwitchApi.getVodDataById(
        streamer.twitchData.id,
        accessToken.access_token,
      );

      const streamData = await TwitchApi.getStreamDataByLogin(
        streamer.twitchUsername,
        accessToken.access_token,
      );

      return {
        ...streamer,
        streamData,
        vodData,
      };
    });

    return await Promise.all(promises);
  }

  static async callContentful(query) {
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
}
