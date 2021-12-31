import {
  verifyMessage,
  authenticate,
  getStream,
  getTags,
  getUsersByLogin,
  getVideo,
  getUsersById,
} from "@lib/Twitch";
import Contentful from "@lib/Contentful";

export default async function handler(req, res) {
  try {
    // eventsub registration verification callback
    if (
      req.headers["twitch-eventsub-message-type"] ===
      "webhook_callback_verification"
    ) {
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
      const challenge = req.body.challenge;
      res.headers = { "Content-Type": "text/html" };
      res.status(200).send(challenge);
      return;
    }

    // eventsub event callback
    if (req.headers["twitch-eventsub-message-type"] === "notification") {
      console.log(req.body);
      const authToken = await authenticate();
      let twitchData = undefined;
      if (req.body.event.broadcaster_user_login || req.body.event.user_login) {
        twitchData = await getUsersByLogin(
          req.body.event.broadcaster_user_login || req.body.event.user_login,
          authToken
        );
      } else {
        twitchData = await getUsersById(
          req.body.event.broadcaster_user_id || req.body.event.user_id,
          authToken
        );
      }
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
        twitchData.data[0].login,
        twitchData.data[0] || {},
        streamData && streamData.data && streamData.data[0]
          ? streamData.data[0]
          : {},
        vodData && vodData.data && vodData.data[0] ? vodData.data[0] : {},
        tagData && tagData.data ? tagData.data : {}
      );
      res.status(200).send();
      return;
    }

    console.log("Bad request!");
    res.status(400).send();
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
}
