import { authenticate, getStream, getTags, getUsersByLogin, getVideo } from "@lib/Twitch";
import Contentful from "@lib/Contentful";

export default async (req, res) => {
  try {
    console.log("Trying refreshall!");

    // authorise
    if (req.headers["whst-subscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY) {
      res.status(401).json();
      return;
    }

    const authToken = await authenticate();
    const usernames = await Contentful.getTwitchUserNames();
    for (let index = 0; index < usernames.length; index++) {
      try {
        const username = usernames[index];
        console.log(`Refeshing data for ${username}`);
        const twitchData = await getUsersByLogin(username, authToken);
        const userid = twitchData.data[0].id;
        const streamData = await getStream(userid, authToken);
        const vodData = await getVideo(userid, authToken);
        const tagData = await getTags(userid, authToken);
        await Contentful.updateStreamerByTwitchUsername(
          username,
          twitchData.data[0] || {},
          streamData.data[0] || {},
          vodData.data[0] || {},
          tagData.data || {},
        );
        console.log(`Data refreshed for ${username}`);
      } catch (error) {
        console.log(error);
      }
    }

    res.status(200).send();

    return;
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const config = {
  type: "experimental-background",
};
