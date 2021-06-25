import { waitFor } from "./Utils";

export default class TwitchApi {
  static getFetchOptions(accessToken) {
    return {
      headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  static async getVodDataById(twitchId, accessToken) {
    const vod = await TwitchApi.call(
      `https://api.twitch.tv/helix/videos?user_id=${twitchId}&first=1`,
      accessToken,
    );

    return vod && vod.length === 1 ? vod[0] : null;
  }

  static async getStreamDataByLogin(twitchUsername, accessToken) {
    const stream = await TwitchApi.call(
      `https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`,
      accessToken,
    );

    return stream && stream.length === 1 ? stream[0] : null;
  }

  static async getUsersbyLogin(usernames, accessToken) {
    if (usernames.length >= 99) {
      throw "Number of users is >= 99! YOU NEED TO SCALE TwitchAPI.getUsersbyLogin()!";
    }

    const usersString = usernames.join("&login=");

    // right now, we have 59 streamers
    // limit is 100
    // TODO: paginate this
    const users = await TwitchApi.call(
      `https://api.twitch.tv/helix/users?login=${usersString}`,
      accessToken,
    );

    return users;
  }

  static async getTwitchDataByLogin(twitchUsername, accessToken) {
    const user = await TwitchApi.call(
      `https://api.twitch.tv/helix/users?login=${twitchUsername}`,
      accessToken,
    );

    return user && user.length === 1 ? user[0] : null;
  }

  static async getAccessToken() {
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

  static async call(url, accessToken) {
    try {
      let response;

      while (true) {
        response = await fetch(url, TwitchApi.getFetchOptions(accessToken));

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
}
