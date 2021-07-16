import fetch from "node-fetch";

export const autheticate = async () => {
  const authResponse = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );
  const json = await authResponse.json();
  return json.access_token;
};

export const deleteAllSubscriptions = async (authToken) => {
  //get current subs
  const subs = await getAllSubscriptions(authToken);
  //iterate current subs and delete
  for (let index = 0; index < subs.length; index++) {
    const sub = subs[index];
    await deleteSubscription(authToken, sub.id);
  }
  return subs.length;
};

export const deleteSubscription = async (authToken, subscriptionid) => {
  await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionid}`,
    { headers: getHeader(authToken), method: "DELETE" }
  );
  return true;
};

export const getHeader = (authToken) => {
  const header = {
    "Client-Id": process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };
  return header;
};

export const getSubscriptions = async (authToken, cursor) => {
  const url = cursor
    ? `https://api.twitch.tv/helix/eventsub/subscriptions?after=${cursor}`
    : `https://api.twitch.tv/helix/eventsub/subscriptions`;
  const subsresponse = await fetch(url, {
    headers: getHeader(authToken),
  });
  return await subsresponse.json();
};

export const getAllSubscriptions = async (authToken) => {
  let subsresponse = await getSubscriptions(authToken);
  let data = subsresponse;
  let pagination = subsresponse.pagination;
  while (pagination.cursor) {
    subsresponse = await getSubscriptions(authToken, pagination.cursor);
    pagination = subsresponse.pagination;
    data.data = subsresponse.data.concat(data.data);
  }
  return data;
};
