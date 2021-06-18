export default class TwitchApi {
  static async getAccessToken() {
    const accessTokenFetchUrl = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials&scope=user_read`;

    try {
      const response = await fetch(accessTokenFetchUrl, {
        method: "POST",
        headers: { accept: "application/vnd.twitchtv.v5+json" },
      });

      return response.json();
    } catch (error) {
      console.log(error);
    }
  }

  static async getTwitchDataByLogin(twitchUsername) {
    const tokenResponse = await TwitchApi.getAccessToken();

    if (tokenResponse.access_token) {
      const fetchOptions = {
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      };

      const userResponse = await fetch(
        `https://api.twitch.tv/helix/users?login=${twitchUsername}`,
        fetchOptions,
      );

      const user = await userResponse.json();
      return user.data;
    }
  }
}
