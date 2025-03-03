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
    key.toLowerCase().startsWith('x-')
  )))
)

const proxy = async (event) => {
  let statusCode
  let body

  try {
    const keysData = await getVerificationKeysData(INTEGRATION_PUBLIC_KEY)

    const _prepareVerificationRequest = prepareVerificationRequest({ keysData, disableRecryption: INTEGRATION_DISABLE_RECRYPTION })
    const _processVerificationResponse = processVerificationResponse({ keysData, disableRecryption: INTEGRATION_DISABLE_RECRYPTION })

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

    const encryptedResponse = await fetch(requestPath, requestOptions).then((_response) => (
      _response.json()
    ))

    statusCode = 200
    body = await _processVerificationResponse(encryptedResponse, derivedSecretKey)
  } catch (error) {
    const message = 'Error proxying API request'
    console.error(message, error)

    statusCode = 500
    body = { error: message }
  }

  return { statusCode, body: JSON.stringify(body), headers: BASE_HEADERS }
}

module.exports = { proxy }
