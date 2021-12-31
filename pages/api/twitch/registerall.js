import { authenticate, createSubscriptions } from "@lib/Twitch";

export default async function handler(req, res) {
  try {
    // authorise
    if (
      req.headers["whst-subscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY
    ) {
      res.status(401).json();
      return;
    }

    const authToken = await authenticate();
    await createSubscriptions(
      authToken,
      process.env.TWITCH_EVENTSUB_CALLBACK_URL
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }

  res.status(200).send();
}
