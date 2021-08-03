import fetch from "node-fetch";
import Contentful from "../lib/Contentful";

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
  for (let index = 0; index < subs.data.length; index++) {
    const sub = subs.data[index];
    await deleteSubscription(authToken, sub.id);
  }
  return subs.data.length;
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

export const createSubscriptions = async (authToken, callbackurl) => {
  const usernames = await Contentful.getTwitchUserNames();
  for (let index = 0; index < usernames.length; index++) {
    const username = usernames[index];
    const users = await getUsersByLogin(username, authToken);
    const user = users.data[0];
    const userid = user.id;
    await createSubscription(authToken, "stream.online", userid, callbackurl);
    await createSubscription(authToken, "stream.offline", userid, callbackurl);
    await createSubscription(authToken, "user.update", userid, callbackurl);
    await createSubscription(authToken, "channel.update", userid, callbackurl);
  }
};

export const createSubscription = async (
  authToken,
  type,
  userid,
  callbackurl
) => {
  const body = {
    type: type,
    version: "1",
    condition: {},
    transport: {
      method: "webhook",
      callback: callbackurl,
      secret: process.env.TWITCH_EVENTSUB_SECRET,
    },
  };
  if (type === "user.update") {
    body.condition.user_id = userid;
  } else {
    body.condition.broadcaster_user_id = userid;
  }
  const request = {
    headers: getHeader(authToken),
    method: "POST",
    body: JSON.stringify(body),
  };
  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    request
  );
  return response;
};

export const getUsersByLogin = async (login, authToken) => {
  const request = {
    headers: getHeader(authToken),
    method: "GET",
  };
  const response = await fetch(
    `https://api.twitch.tv/helix/users?login=${login}`,
    request
  );
  return await response.json();
};

export const getUsersById = async (id, authToken) => {
  const request = {
    headers: getHeader(authToken),
    method: "GET",
  };
  const response = await fetch(
    `https://api.twitch.tv/helix/users?id=${id}`,
    request
  );
  return await response.json();
};

export const getChannel = async (id, authToken) => {
  const request = {
    headers: getHeader(authToken),
    method: "GET",
  };
  const response = await fetch(
    `https://api.twitch.tv/helix/channels?broadcaster_id=${id}`,
    request
  );
  return await response.json();
};

export const getStream = async (id, authToken) => {
  const request = {
    headers: getHeader(authToken),
    method: "GET",
  };
  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_id=${id}`,
    request
  );
  return await response.json();
};

export const getVideo = async (id, authToken) => {
  const request = {
    headers: getHeader(authToken),
    method: "GET",
  };
  const response = await fetch(
    `https://api.twitch.tv/helix/videos?user_id=${id}&first=1`,
    request
  );
  return await response.json();
};

export const getTags = async (id, authToken) => {
  const request = {
    headers: getHeader(authToken),
    method: "GET",
  };
  const response = await fetch(
    `https://api.twitch.tv/helix/streams/tags?broadcaster_id=${id}`,
    request
  );
  return await response.json();
};
