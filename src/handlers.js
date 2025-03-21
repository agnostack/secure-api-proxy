const {
  getVerificationKeysData,
  prepareVerificationRequest,
  processVerificationResponse,
} = require('@agnostack/verifyd')

const {
  BASE_API_PATH,
  API_CLIENT_ID,
  API_CLIENT_SECRET,
  INTEGRATION_PUBLIC_KEY,
  INTEGRATION_DISABLE_RECRYPTION, // NOTE: this will not work unless running your own local BASE_API_PATH
} = process.env

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

const filterHeaders = (headers) => (
  Object.fromEntries(Object.entries(headers).filter(([key]) => (
    key?.toLowerCase?.().startsWith?.('x-') ?? false
  )))
)

const proxy = async (event) => {
  let statusCode
  let body

  try {
    const keysData = await getVerificationKeysData(INTEGRATION_PUBLIC_KEY)

    const _prepareVerificationRequest = prepareVerificationRequest({ keysData, disableRecryption: INTEGRATION_DISABLE_RECRYPTION })

    const [
      requestPath,
      requestOptions,
      derivedSecretKey
    ] = await _prepareVerificationRequest(`${BASE_API_PATH}/${event?.pathParameters?.route}`, {
      method: 'POST',
      body: JSON.parse(event?.body ?? '{}'),
      headers: {
        ...filterHeaders(event?.headers),
        'X-Client-Id': API_CLIENT_ID,
        'X-Client-Secret': API_CLIENT_SECRET,
      },
    }) ?? []

    const { disableRecryption, response } = await fetch(requestPath, requestOptions).then(async (_response) => ({
      disableRecryption: ((_response.status === 412) || (_response.status > 499)) ? true : INTEGRATION_DISABLE_RECRYPTION,
      response: await _response.json()
    }))

    const _processVerificationResponse = processVerificationResponse({ keysData, disableRecryption })

    statusCode = 200
    body = await _processVerificationResponse(response, derivedSecretKey)
  } catch (error) {
    const message = 'Error proxying API request'
    console.error(message, error)

    statusCode = 500
    body = { error: message }
  }

  return { statusCode, headers: BASE_HEADERS, body: JSON.stringify(body) }
}

module.exports = { proxy }
