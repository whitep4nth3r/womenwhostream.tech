import { autheticate, deleteAllSubscriptions } from "../../lib/Twitch";

export default async function handler(req, res) {
  try {
    var body = {};
    body.method = req.method;
    if (
      req.headers["whst-suscriptionkey"] !== process.env.API_SUBSCRIPTION_KEY
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
          } else if (req.query.action === "delete") {
            // delete all event sub registrations
            const authToken = await autheticate();
            const deleteCount = await deleteAllSubscriptions(authToken);
            body.deleted = deleteCount || 0;
          }
        }
      }
    } else if (req.method === "POST") {
      //
    }
    res.status(200).json(body);
  } catch (error) {
    res.status(400).json(error);
  }
}
