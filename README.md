## Description

[Nest JS](https://github.com/nestjs/nest) Notify App with [TypeORM](https://typeorm.io/)

## Project Installation

```bash
$ npm install
```

## Running the app

```bash
# development(v1)
$ npm run start

# development(v1)
$ nest start

# watch mode(v1)
$ npm run start:dev

# watch mode(v2)
$ nest start --watch

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stay in touch

Author: Sergiu Chilat

- Personal website: [Sergiu Chilat](https://sergiu.live)
- GitHub Profile [https://github.com/sergiuchilat](https://github.com/sergiuchilat)

Contributors:

- Vlad Verestiuc [https://github.com/vvlad](https://github.com/vlad)
- Corina Cernolev [https://github.com/CernolevCorina](https://github.com/CernolevCorina)
- Vadim Poscoi [https://github.com/Vady4ek](https://github.com/Vady4ek)
- Daniel Maga [https://github.com/magadanuhak](https://github.com/magadanuhak)
- Alexandr Gluscov [https://github.com/gluha228](https://github.com/gluha228)

# Telegram Bot Interaction

## Step 1: Start subscription

When user click the button "Subscribe to Telegram" then Front end will send a Request to Core API:

Request`POST telegram/subscribe/{user.uuid}`

Payload:

```
NULL
```

If there is a subscription started for the user then het this existing subscription otherwise create a new one and return it.

#### Telegram subscriptions table

Table name: **telegram_subscriptions**

Fields:

- id
- uuid - generated UUID
  - type = UUID
  - required = true
- started_at - subscription start datetime
  - type = datetime
  - required true
  - default = NOW
- confirmed_at - subscription confirmation datetime
  - type = datetime
  - required true
  - default = NULL
- user_uuid - authenticated User.uuid
  - type = UUID
  - required = true
  - unique = true
- telegram_username - the Telegram username
  - string
  - min 5
  - max 32
  - default = NULL

> Create a Cron Job to delete unfinished subscriptions older than 15 minutes =\> confirmed_at = NULL AND created_at \>\<NOW - 5 minutes

### CoreAPI -\> Telegram Microservice start subscription request

Core API will send a request to Telegram messenger

Request `POST telegram/subscribe`

Payload:

Headers

```
x-api-key: SECRET_KEY
```

> SECRET_KEY must be storend in ENV on Core API and Telegram microservice and will have the same value

Body

```
{
  "subscriber_uuid": User.uuid or User.username,
  "language": User.language,
  "subscription_uuid": telegram_subscriptions.uuid,
  "callback_urls": {
    "subscribed_success": "telegram/subscribe/{User.uuid}/success",
    "subscribed_error": "telegram/subscribe/{User.uuid}/error",
    "unsubscribe_url": "telegram/unsubscribe/{User.uuid}"
  }
}
```

After starting subscription one of the following responses can be returned. If any error will be returned Fronted will show this error. In case of success a new tab with TelegramBot page subscription will be opened.

Also, a button "Check subscription" appears.

### RS.1.1 Successfully started

`Code 201`

Response body

```
{
  "id": 10,
  "receiver_uuid": "74326f56-16ca-49dd-9679-deb992d5534d",
  "chat_id": null,
  "language": "en",
  "callback_url_subscribed_success": "https://example.com/subscribed_success",
  "callback_url_subscribed_error": "https://example.com/subscribed_error",
  "callback_url_unsubscribe": "https://example.com/unsubscribe",
  "created_at": "2024-03-29T19:45:41.881Z",
  "confirmed_at": null,
  "bot_name": "BitsoftTestBot"
}
```

After receiving the response Frontend must open the URL [https://t.me/{NameOfTheBot}?start={response.subscription_uuid}---{user.language}](https://t.me/%7BNameOfTheBot%7D?start=%7Bresponse.subscription_uuid%7D---%7Buser.language%7D) in a new tab.

If user starts conversation with the Telegram bot then Telegram application will be opened and Start command will be executed. Start command will start **Step 2**

### RE.1.2 Invalid auth key

This response will be returned in case if Core API and Telegram microservice keys do not match.

`Code 401`

Response body

```
{
  "error_code": "INVALID_KEY"
}
```

### RE.1.3 Already subscribed

This response will be returned in case if Telegram microservice return this error. Core API will work as a proxy that will pass the response from Telegram API to frontend.

Code `409`

Response body

```
 { "error_code": "SUBSCRIBER_ALREADY_EXISTS" }
```

### RE.1.4 Exception

This response will be returned in case if Telegram microservice return this error. Core API will work as a proxy that will pass the response from Telegram API to frontend.

`Code 500`

Response body

```
{
  "error_code": "UNHANDLED_EXCEPTION"
}
```

## Step 2: Confirm subscription

There are 3 possible cases:

- Successfully subscribed
- Subscriber not found
- Already subscribed

### RS.2.1 Successfully subscribed

The Core API must implement an endpoint on the URL passed as `callback_url_success` param when Core API started subscription.

On successfully subscription conformation by the user, Telegram Microservice will send a POST request to this endpoint.

URL `telegram/subscribe/success`

Payload:

Headers

```
x-api-key: SECRET_KEY
```

> SECRET_KEY must be stored in ENV on Core API and Telegram microservice and will have the same value

Body

```
{
  "subscriber_uuid": User.uuid,
  "telegram_username": "sergiuchilat",
  "bot_name": "NameOfTheBot",
  "chat_id": 123123
}
```

Core API must implement the following:

update the table **telegram_subscriptions** where Payload.subscriber_uuid = telegram_subscriptions.user_uuid AND telegram_subscriptions.subscription_uuid = payload.subscription_uuid

- confirmed_at = NOW()
- telegram_username = payload.telegram_username

On the frontend add also a button "Check subscription".

## Frontend check subscription

When open subscription interface or click the button "Check subscription" a request will be sent to Core API

Request `GET telegram/subscribe/{user.uuid}/status`

Payload:

```
NULL
```

In case if user is subscribed the response will be

`Code 200`

Response body

```
{
    "subscribed_at": telegram_subscriptions.confirmed_at,
    "telegram_username": telegram_subscriptions.telegram_username
}
```

> To show on Frontend subscription date and Telegram username.

In case if user is NOT subscribed the response will be

`Code 404`

Response body

```
NULL
```

> To show on Frontend that user is not subscribed.

If user is subscribed then "Subscribe to Telegram button" will be disabled.

### RE.2.2 Unhandled exception

> Error handling in CORE Api will be implemented later

## Node.js Express App sample to test callback URLs from the Telegram bot

```javascript
const express = require('express');

const app = express();
const port = 5555;

app.use(express.json());

app.post('/telegram/subscribe/success', (req, res) => {
  const response = {
    ...req.body,
    success: true,
  };
  console.log(response);
  res.send(response);
});

app.post('/telegram/subscribe/error', (req, res) => {
  const response = {
    ...req.body,
    error: true,
  };
  console.log(response);
  res.send(response);
});

app.post('/telegram/unsubscribe', (req, res) => {
  const response = {
    ...req.body,
    error: true,
  };
  console.log(response);
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

# WhatsApp Notifications

To avoid re-authentication after container restart, you need to add two volumes that the `whatsappweb.js` library creates to store the session:

- `wwebjs_auth_data:/app/.wwebjs_auth`
- `wwebjs_cache_data:/app/.wwebjs_cache`

After launching the application, you will see a QR code in the console as a base64-encoded image. Paste the code into a browser and scan it with the WhatsApp mobile app. Should be regular WhatsApp account, not a business account

![QR Code](data:image/png;base64,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)

Next, give your WhatsApp account the name of your bot and add it as a member of the group to which you want to send notifications.

# Slack Notifications Integration

Follow these steps to set up and send notifications to Slack channels using the Slack API.

---

## 1. Create a Slack App

- Go to the [Slack API App page](https://api.slack.com/apps).
- Click on **Create New App** and follow the prompts to create your Slack app.

---

## 2. Install the App to Your Workspace

- After creating the app, install it in your Slack workspace.

---

## 3. Get the Bot User OAuth Token

- Navigate to **"Install App"** in your Slack app settings.
- Copy the **Bot User OAuth Token** (e.g., `xoxb-123456789-abcdefghijk`).

---

## 4. Add Slack Configuration to Your Environment

Add the following keys to your environment variables (`.env` file):

```env
SLACK_TOKEN=YOUR_BOT_USER_OAUTH_TOKEN
SLACK_API_URL=https://slack.com/api
```

## 5. Fetch list of channels

`GET /api/v1/notifications/slack/conversations`

## 6. Send notifications

`POST /api/v1/slack/notifications`

```
{
  "receivers": ["CHANNEL_ID"],
  "subject": "Your subject here",
  "body": "Your notification message here"
}
```

## License

This is open source project licensed under the [MIT license](https://opensource.org/license/mit/).
