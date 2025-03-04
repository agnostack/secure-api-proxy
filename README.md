# Secure API Proxy 🚀

This repository is a sample repo for wrapping the agnoStack API with secure encryption.

---

## Prerequisites

- Node.js (v18.20.0 or higher)
- Yarn (or similar package manager)
- nvm (optional)

```bash
nvm install
```

```bash
npm install yarn -g
```

## Install repo dependencies

```bash
yarn install
```

## Setup env vars

Populate `.env` with the provider values from agnoStack.

- API_CLIENT_ID
- API_CLIENT_SECRET
- INTEGRATION_PUBLIC_KEY

## Local testing

```bash
yarn watch
```

NOTE: this will run your local project via serverless offline AND also generate an ngrok URL that you can then use to access.

Requests can then be made via `https://<<generated>>.ngrok.app/agnostack/<<xyz-api-route>>` or `http://localhost:3000/dev/agnostack/<<xyz-api-route>>`

## AWS Deployment

```bash
yarn deploy
```

## Postman Collection

agnoStack API sample postman requests available via: https://agnostack.dev/postman.json

## Making requests

All requests must contain the following request headers, provided from agnoStack.

- X-Organization-Id
- X-Stack-Id

```bash
curl --location --request POST 'https://<<generated>>.ngrok.app/agnostack/orders/12345' \
--header 'X-Organization-Id: YOUR_ORGANIZATION_ID' \
--header 'X-Stack-Id: YOUR_STACK_ID'
```
