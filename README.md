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

* id
* uuid - generated UUID
    * type = UUID
    * required = true
* started_at - subscription start datetime
    * type = datetime
    * required true
    * default = NOW
* confirmed_at - subscription confirmation datetime
    * type = datetime
    * required true
    * default = NULL
* user_uuid - authenticated User.uuid
    * type = UUID
    * required = true
    * unique = true
* telegram_username - the Telegram username
    * string
    * min 5
    * max 32
    * default = NULL

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

* Successfully subscribed
* Subscriber not found
* Already subscribed

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

* confirmed_at = NOW()
* telegram_username = payload.telegram_username

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
    }
    console.log(response);
    res.send(response);
});

app.post('/telegram/subscribe/error', (req, res) => {
    const response = {
        ...req.body,
        error: true,
    }
    console.log(response);
    res.send(response);
});

app.post('/telegram/unsubscribe', (req, res) => {
    const response = {
        ...req.body,
        error: true,
    }
    console.log(response);
    res.send(response);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

```

## License

This is open source project licensed under the [MIT license](https://opensource.org/license/mit/).
