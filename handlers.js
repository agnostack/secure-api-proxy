const {
  getVerificationKeysData,
  prepareVerificationRequest,
  processVerificationResponse,
} = require('@agnostack/verifyd')

const { BASE_API_PATH, INTEGRATION_PUBLIC_KEY } = process.env

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

const proxy = async (event) => {
  let statusCode
  let body

  try {
    const keysData = await getVerificationKeysData(INTEGRATION_PUBLIC_KEY)
    const _prepareVerificationRequest = prepareVerificationRequest({ keysData })
    const _processVerificationResponse = processVerificationResponse({ keysData })

    const url = `${BASE_API_PATH}/${event?.pathParameters?.route}`
    const options = {
      method: 'POST',
      body: event?.body,
      headers: event?.headers,
    }

    const [
      requestPath,
      requestOptions,
      derivedSecretKey
    ] = await _prepareVerificationRequest(url, options) ?? []

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
