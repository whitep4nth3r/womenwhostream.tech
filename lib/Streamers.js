import TwitchApi from "@lib/Twitch";
import { sortStreamers } from "@lib/Utils";

export default class Streamers {
  static CACHE = [];

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
    const streamers = await Streamers.getAll();

    const filtered = streamers.filter((streamer) => {
      const tagSlugs = streamer.tagsCollection.items.map((tag) => tag.slug);
      return tagSlugs.includes(tagSlug);
    });

    return filtered;
  }

  static async getAll() {
    if (Streamers.CACHE.length > 0) {
      return Streamers.CACHE;
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
      const streamers = await this.callContentful(query);
      const mergedData = await Streamers.mergeStreamersWithTwitchData(
        streamers.data.streamerCollection.items,
      );

      mergedData.sort(sortStreamers);
      Streamers.CACHE = mergedData;

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

    const composedData = [];

    // load streamers in serial rather than parallel to avoid overhwhelming the API
    for (let streamer of mergedStreamers) {
      const vodData = await TwitchApi.getVodDataById(
        streamer.twitchData.id,
        accessToken.access_token,
      );

      const streamData = await TwitchApi.getStreamDataByLogin(
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
