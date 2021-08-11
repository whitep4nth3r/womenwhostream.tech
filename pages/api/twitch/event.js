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
    // authorise incoming message
    const verified = verifyMessage(
      req.headers["twitch-eventsub-message-id"],
      req.headers["twitch-eventsub-message-timestamp"],
      req.body,
      req.headers["twitch-eventsub-message-signature"]
    );
    if (!verified) {
      console.log("Message signature failed verification!");
      res.status(401).send();
      return;
    }

    // eventsub registration verification callback
    if (
      req.headers["twitch-eventsub-message-type"] ===
      "webhook_callback_verification"
    ) {
      const challenge = req.body.challenge;
      res.headers = { "Content-Type": "text/html" };
      res.status(200).send(challenge);
      return;
    }

    // eventsub event callback
    if (req.headers["twitch-eventsub-message-type"] === "notification") {
      const authToken = await authenticate();
      const twitchData = await getUsersByLogin(
        req.body.event.broadcaster_user_login,
        authToken
      );
      const streamData = await getStream(
        req.body.event.broadcaster_user_id,
        authToken
      );
      const vodData = await getVideo(
        req.body.event.broadcaster_user_id,
        authToken
      );
      const tagData = await getTags(
        req.body.event.broadcaster_user_id,
        authToken
      );
      await Contentful.updateStreamerByTwitchUsername(
        req.body.event.broadcaster_user_login,
        twitchData.data[0] || {},
        streamData.data[0] || {},
        vodData.data[0] || {},
        tagData.data || {}
      );
      res.status(200).send();
      return;
    }

    console.log("Bad request!");
    res.status(400).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}
