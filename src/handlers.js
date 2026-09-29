const {
  getVerificationKeysData,
  prepareVerificationRequest,
  processVerificationResponse,
} = require('@agnostack/verifyd')

const {
  BASE_API_PATH,
  INTEGRATION_API_KEY,
  INTEGRATION_ORGANIZATION_ID,
  INTEGRATION_GROUP_ID,
  INTEGRATION_PROVIDERSTACK_ID,
  INTEGRATION_CONNECTION_ID,
  INTEGRATION_PUBLIC_KEY,
  INTEGRATION_DISABLE_RECRYPTION, // NOTE: this will not work unless running your own local BASE_API_PATH
} = process.env

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

const SAVED_HEADERS = {
  'X-Api-Key': INTEGRATION_API_KEY,
  'X-Organization-Id': INTEGRATION_ORGANIZATION_ID,
  'X-Group-Id': INTEGRATION_GROUP_ID,
  'X-Providerstack-Id': INTEGRATION_PROVIDERSTACK_ID,
  'X-Connection-Id': INTEGRATION_CONNECTION_ID,
}

const TARGET_HEADERS = ['x-connection-id', 'x-providerstack-id']

const filterHeaders = (headers) => (
  Object.fromEntries(Object.entries(headers).filter(([key]) => (
    key?.toLowerCase?.()?.startsWith?.('x-') ?? false
  )))
)

const addSavedHeaders = (headers) => {
  const sentKeys = Object.keys(headers).map((key) => key.toLowerCase())
  const sentTarget = TARGET_HEADERS.some((key) => sentKeys.includes(key))

  const savedHeaders = Object.entries(SAVED_HEADERS).filter(([key, value]) => (
    value &&
    !sentKeys.includes(key.toLowerCase()) &&
    !(sentTarget && TARGET_HEADERS.includes(key.toLowerCase()))
  ))

  return { ...Object.fromEntries(savedHeaders), ...headers }
}

const proxy = async (event) => {
  let statusCode
  let body

  try {
    const query = new URLSearchParams(event?.queryStringParameters ?? {}).toString()
    const { origin, pathname, search } = new URL(`${BASE_API_PATH}/${event?.pathParameters?.route}${query ? `?${query}` : ''}`)

    const keysData = await getVerificationKeysData(INTEGRATION_PUBLIC_KEY)

    const _prepareVerificationRequest = prepareVerificationRequest({ keysData, disableRecryption: INTEGRATION_DISABLE_RECRYPTION })

    const [
      requestPath,
      requestOptions,
      derivedSecretKey
    ] = await _prepareVerificationRequest(pathname, {
      method: event?.httpMethod,
      body: event?.body ? JSON.parse(event.body) : undefined,
      headers: addSavedHeaders(filterHeaders(event?.headers ?? {})),
    }) ?? []

    const response = await fetch(`${origin}${requestPath}${search}`, requestOptions)
    const responseBody = await response.json()

    const _processVerificationResponse = processVerificationResponse({ keysData, disableRecryption: INTEGRATION_DISABLE_RECRYPTION })

    statusCode = response.status
    body = Array.isArray(responseBody)
      ? await _processVerificationResponse(responseBody, derivedSecretKey)
      : responseBody
  } catch (error) {
    const message = 'Error proxying API request'
    console.error(message, error)

    statusCode = 500
    body = { error: message }
  }

  return { statusCode, headers: BASE_HEADERS, body: JSON.stringify(body) }
}

module.exports = { proxy }
