import {
  verifyMessage,
  authenticate,
  getStream,
  getTags,
  getUsersByLogin,
  getVideo,
} from "@lib/Twitch";
import Contentful from "@lib/Contentful";

export default async function handler(req, res) {
  try {
    // authorise
    if (req.headers["whst-subscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY) {
      res.status(401).json();
      return;
    }

    let username = req.query.login;

    if (!username && req.body.sys.id) {
      username = await Contentful.getTwitchUserName(req.body.sys.id);
    }

    const authToken = await authenticate();
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
      false,
    );
    res.status(200).send();
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}
