import { authenticate, createSubscription, getUsersByLogin } from "@lib/Twitch";
import Contentful from "@lib/Contentful";

export default async function handler(req, res) {
  try {
    // authorise
    console.log("Calling register!");

    if (req.headers["whst-subscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY) {
      res.status(401).json();
      return;
    }

    let username = req.query.login;
    if (!username && req.body.sys.id) {
      username = await Contentful.getTwitchUserName(req.body.sys.id);
    }

    const callbackurl = process.env.TWITCH_EVENTSUB_CALLBACK_URL;
    const authToken = await authenticate();
    const users = await getUsersByLogin(username, authToken);
    const user = users.data[0];
    const userid = user.id;
    await createSubscription(authToken, "stream.online", userid, callbackurl);
    await createSubscription(authToken, "stream.offline", userid, callbackurl);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }

  res.status(200).send();
}
