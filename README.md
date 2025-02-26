# Secure API Proxy

This repository is a sample repo for wrapping the agnoStack API with secure encryption.

---

## Install

```bash
nvm use
yarn install
```

## Setup env vars

Create a `.env` from the provided example.

```bash
cp .env.example .env
```

Enter values for `INTEGRATION_PUBLIC_KEY` and `BASE_API_PATH` given the values provided from agnoStack.

## Local testing

```bash
yarn watch
```

Post requests can then be made via `http://localhost:3000/dev/agnoStack/orders/12345`

## AWS Deployment

```bash
yarn deploy
```

## Making requests

All requests must contain the following request headers, provided from agnoStack.

- x-organization-id
- x-providerstack-id

```bash
curl --location --request POST 'http://localhost:3000/dev/agnoStack/orders/12345' \
--header 'x-organization-id: YOUR_ORGANIZATION_ID' \
--header 'x-providerstack-id: YOUR_PROVIDERSTACK_ID'
```
