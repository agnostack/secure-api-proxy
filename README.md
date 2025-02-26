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

Post requests can then be made via `http://localhost:3000/dev/agnostack/orders/12345`

## AWS Deployment

```bash
yarn deploy
```

## Making requests

All requests must contain the following request headers, provided from agnoStack.

- x-organization-id
- x-providerstack-id

```bash
curl --location --request POST 'http://localhost:3000/dev/agnostack/orders/12345' \
--header 'x-organization-id: YOUR_ORGANIZATION_ID' \
--header 'x-providerstack-id: YOUR_PROVIDERSTACK_ID'
```
