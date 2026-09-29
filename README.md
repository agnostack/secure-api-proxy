# Secure API Proxy 🚀

This repository is a sample repo for wrapping the agnoStack API with secure encryption.

---

## Prerequisites

- Node.js (v22 or higher)
- pnpm (or similar package manager)
- AWS SAM CLI
- Docker (running)
- nvm (optional)

```bash
nvm install
```

```bash
npm install pnpm -g
```

## Install repo dependencies

```bash
pnpm install
```

## Setup env vars

`.env` holds the shared settings, such as `BASE_API_PATH` (the API address, ending in `/integration/api`). Change it there to call a different API.

Copy `.env.local.example` to `.env.local` and populate it with your values from agnoStack.

- INTEGRATION_PUBLIC_KEY

Optionally, the request headers can also be set here instead of being sent with every request. A header sent with the request wins.

- INTEGRATION_API_KEY (`X-Api-Key`)
- INTEGRATION_ORGANIZATION_ID (`X-Organization-Id`)
- INTEGRATION_GROUP_ID (`X-Group-Id`)
- INTEGRATION_CONNECTION_ID (`X-Connection-Id`)
- INTEGRATION_PROVIDERSTACK_ID (`X-Providerstack-Id`)

If a request sends `X-Connection-Id` or `X-Providerstack-Id`, neither of those two saved values is used.

## Local testing

```bash
pnpm run watch
```

NOTE: this will run your local project via `sam local start-api` AND also generate an ngrok URL that you can then use to access.

Requests can then be made via `https://<<generated>>.ngrok.app/agnostack/<<xyz-api-route>>` or `http://localhost:4000/agnostack/<<xyz-api-route>>`

## AWS Deployment

```bash
pnpm run deploy
```

Deploys the `agnostack-secure-api-proxy` stack with AWS SAM. Requests can then be made via `<<deployed API URL>>/dev/agnostack/<<xyz-api-route>>`

## Making requests

All requests must contain the following request headers, provided from agnoStack, unless they are set in `.env.local`.

- X-Api-Key
- X-Organization-Id
- X-Group-Id
- X-Connection-Id or X-Providerstack-Id

The request method (GET, POST, PUT) is passed through to the API.

```bash
curl --location --request GET 'https://<<generated>>.ngrok.app/agnostack/order/12345' \
--header 'X-Api-Key: YOUR_API_KEY' \
--header 'X-Organization-Id: YOUR_ORGANIZATION_ID' \
--header 'X-Group-Id: YOUR_GROUP_ID' \
--header 'X-Connection-Id: YOUR_CONNECTION_ID'
```
