# Serverless Function Configuration

## Vercel Environment Vars

The following environment vars should be setup in vercel:

| Variable Name                | Description                                            | Example                                                                                                        |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| API_SUBSCRIPTION_KEY         | The custom function subscription key                   | 9f2bc6d252bc405d94e0eee5fbd20102                                                                               |
| TWITCH_EVENTSUB_CALLBACK_URL | The callback url for the twitch eventsub subscriptions | https://my-app-name.vercel.app/api/twitch/event                                                                |
| TWITCH_CLIENT_ID             | The twitch api client id                               | see https://dev.twitch.tv/docs/api/                                                                            |
| TWITCH_CLIENT_SECRET         | The twitch api client secret                           | see https://dev.twitch.tv/docs/api/                                                                            |
| TWITCH_EVENTSUB_SECRET       | The twitch eventsub secret                             | dfda12648e5d4688b45cfac7ec549e53                                                                               |
| CTFL_CM_ACCESS_TOKEN         | Contentful content management token                    | see https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/authentication |
| CTFL_SPACE_ID                | Contentful space id                                    | see https://www.contentful.com/help/find-space-id/                                                             |
| CTFL_ENVIRONMENT_ID          | Contentful environemt id                               | master                                                                                                         |
| CTFL_ACCESS_TOKEN            | Contentful access token                                | see https://www.contentful.com/faq/personal-access-tokens/                                                     |

## Contentful Webhooks

### Publish Streamer Webhook

The publish stream webhook should be setup as follows:

| Property     | Value                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Name         | Streamer Publish                                                                                     |
| URL          | https://my-app-name.vercel.app/api/twitch/register                                                   |
| Triggers     | ✅ Trigger for specific events                                                                       |
| Events       | Entry > Publish                                                                                      |
| Filter       | Environment Id equals master                                                                         |
| Filter       | Content Type Id equals streamer                                                                      |
| Header       | Secret Header "whst-subscriptionkey" with the same value as the API_SUBSCRIPTION_KEY environment var |
| Content Type | application/json                                                                                     |
| Payload      | ✅ Use default payload                                                                               |

### Unpublish Streamer Webhook

The unpublish stream webhook should be setup as follows:

| Property     | Value                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Name         | Streamer Unublish                                                                                    |
| URL          | https://my-app-name.vercel.app/api/twitch/delete                                                     |
| Triggers     | ✅ Trigger for specific events                                                                       |
| Events       | Entry > Unpublish                                                                                    |
| Filter       | Environment Id equals master                                                                         |
| Filter       | Content Type Id equals streamer                                                                      |
| Header       | Secret Header "whst-subscriptionkey" with the same value as the API_SUBSCRIPTION_KEY environment var |
| Content Type | application/json                                                                                     |
| Payload      | ✅ Use default payload                                                                               |
