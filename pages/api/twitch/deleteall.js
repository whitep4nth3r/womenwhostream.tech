import { authenticate, deleteAllSubscriptions } from "@lib/Twitch";

export default async function handler(req, res) {
  let body = {};
  try {
    // authorise
    if (
      req.headers["whst-subscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY
    ) {
      res.status(401).json();
      return;
    }

    const authToken = await authenticate();
    const deleteCount = await deleteAllSubscriptions(authToken);
    body.deleted = deleteCount || 0;
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }

  res.status(200).send(body);
}
