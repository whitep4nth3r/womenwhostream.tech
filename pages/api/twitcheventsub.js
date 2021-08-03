import {
  autheticate,
  createSubscriptions,
  deleteAllSubscriptions,
  getChannel,
  getStream,
  getTags,
  getUsersByLogin,
  getVideo,
} from "../../lib/Twitch";
import { createHmac } from "crypto";
import Contentful from "@lib/Contentful";

export default async function handler(req, res) {
  try {
    var body = {};
    body.method = req.method;
    if (
      req.headers["twitch-eventsub-message-type"] ===
      "webhook_callback_verification"
    ) {
      // verify subscription
      const hmac_message =
        req.headers["twitch-eventsub-message-id"] +
        req.headers["twitch-eventsub-message-timestamp"] +
        Buffer.from(JSON.stringify(req.body), "utf8");
      const signature = createHmac("sha256", process.env.TWITCH_EVENTSUB_SECRET)
        .update(hmac_message)
        .digest("hex");
      if (
        req.headers["twitch-eventsub-message-signature"] !==
        `sha256=${signature}`
      ) {
        res.status(403);
        return;
      }
      const challenge = req.body.challenge;
      res.headers = { "Content-Type": "text/html" };
      res.status(200).send(challenge);
      return;
    } else if (req.headers["twitch-eventsub-message-type"] === "notification") {
      const authToken = await autheticate();
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
        tagData.data[0] || {}
      );
    } else if (
      req.headers["whst-subscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY
    ) {
      body.error = "Not Authenticated";
      res.status(401).json(body);
      return;
    }

    if (req.method === "GET") {
      if (req.query) {
        if (req.query.action) {
          body.action = req.query.action;
          if (req.query.action === "register") {
            // register event sub
            const authToken = await autheticate();
            await createSubscriptions(
              authToken,
              process.env.TWITCH_EVENTSUB_CALLBACK_URL
            );
          } else if (req.query.action === "delete") {
            // delete all event sub registrations
            const authToken = await autheticate();
            const deleteCount = await deleteAllSubscriptions(authToken);
            body.deleted = deleteCount || 0;
          }
        }
      }
    } else if (req.method === "POST") {
      body.action = req.query.action;
    }
    res.status(200).json(body);
  } catch (error) {
    console.log(JSON.stringify(error));
    res.status(400).json({ error: error });
  }
}
