import { authenticate, createSubscription, getUsersByLogin } from "@lib/Twitch";

export default async function handler(req, res) {
  try {
    // authorise
    if (
      req.headers["whst-subscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY
    ) {
      res.status(401).json();
      return;
    }

    const username = req.query.login;
    const callbackurl = process.env.TWITCH_EVENTSUB_CALLBACK_URL;
    const authToken = await authenticate();
    const users = await getUsersByLogin(username, authToken);
    const user = users.data[0];
    const userid = user.id;
    await createSubscription(authToken, "stream.online", userid, callbackurl);
    await createSubscription(authToken, "stream.offline", userid, callbackurl);
    await createSubscription(authToken, "user.update", userid, callbackurl);
    await createSubscription(authToken, "channel.update", userid, callbackurl);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }

  res.status(200).send();
}
