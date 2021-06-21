import TwitchApi from "@twitch/api";

function sortStreamersByLive(a, b) {
  if (a.streamData.length === 1 && b.streamData.length === 1) {
    // if both live, highest viewers first
    return a.streamData.viewer_count - b.streamData.viewer_count;
  } else if (a.streamData.length === 1 && b.streamData.length === 0) {
    // if a live
    return -1;
  } else if (b.streamData.length === 1 && a.streamData.length === 0) {
    // if b live
    return 1;
  } else if (a.vodData.length === 1 && b.vodData.length === 1) {
    // order by most recently published VOD
    const a_timestamp = Date.parse(a.vodData[0].published_at);
    const a_date = new Date(a_timestamp);

    const b_timestamp = Date.parse(b.vodData[0].published_at);
    const b_date = new Date(b_timestamp);

    return b_date - a_date;
  } else {
    return 0;
  }
}

export default class ContentfulApi {
  static async getAllTags() {
    const query = `{
    tagCollection {
      total
      items {
        name
        slug
      }
    }
  }`;

    const tags = await this.callApi(query);
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

    const tags = await this.callApi(query);
    return tags.data.tagCollection.items[0];
  }

  static async getStreamersByTag(tagSlug) {
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
      const streamers = await this.callApi(query);
      const mergedData = await ContentfulApi.mergeStreamersWithTwitchData(
        streamers.data.tagCollection.items[0].linkedFrom.streamerCollection.items,
      );
      mergedData.sort(sortStreamersByLive);
      return mergedData;
    } catch (error) {
      console.log(error);
    }
  }

  static async getAllStreamers() {
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
      const streamers = await this.callApi(query);
      const mergedData = await ContentfulApi.mergeStreamersWithTwitchData(
        streamers.data.streamerCollection.items,
      );

      mergedData.sort(sortStreamersByLive);
      return mergedData;
    } catch (error) {
      console.log(error);
    }
  }

  static async mergeStreamersWithTwitchData(streamers) {
    const accessToken = await TwitchApi.getAccessToken();

    const promises = streamers.map(async (streamer) => {
      const twitchData = await TwitchApi.getTwitchDataByLogin(
        streamer.twitchUsername,
        accessToken.access_token,
      );

      const vodData = await TwitchApi.getVodDataById(twitchData[0].id, accessToken.access_token);

      const streamData = await TwitchApi.getStreamDataByLogin(
        streamer.twitchUsername,
        accessToken.access_token,
      );

      return {
        ...streamer,
        twitchData,
        streamData,
        vodData,
      };
    });

    return await Promise.all(promises);
  }

  static async callApi(query) {
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
