const { spawnSync } = require('node:child_process')
const { existsSync, readFileSync } = require('node:fs')
const { parseEnv } = require('node:util')

const { parseEnvData } = require('@agnostack/env')

const DEFAULT_PORT = 4000

const ENV_FILES = ['.env', '.env.local']

const PARAMETERS = {
  BASE_API_PATH: 'BaseApiPath',
  INTEGRATION_PUBLIC_KEY: 'IntegrationPublicKey',
  INTEGRATION_API_KEY: 'IntegrationApiKey',
  INTEGRATION_ORGANIZATION_ID: 'IntegrationOrganizationId',
  INTEGRATION_GROUP_ID: 'IntegrationGroupId',
  INTEGRATION_CONNECTION_ID: 'IntegrationConnectionId',
  INTEGRATION_PROVIDERSTACK_ID: 'IntegrationProviderstackId',
  INTEGRATION_DISABLE_RECRYPTION: 'IntegrationDisableRecryption',
}

const readEnvFiles = () => ENV_FILES.reduce((env, file) => ({
  ...env,
  ...existsSync(file) && parseEnv(readFileSync(file, 'utf8')),
}), {})

const getParameterOverrides = () => {
  const env = readEnvFiles()

  const overrides = Object.entries(PARAMETERS)
    .filter(([key]) => env[key])
    .map(([key, name]) => `${name}="${env[key]}"`)

  return overrides.length ? ['--parameter-overrides', overrides.join(' ')] : []
}

const sam = (args) => {
  const { status, error } = spawnSync('sam', args, { stdio: 'inherit' })

  if (error) {
    console.error(`sam failed: ${error.message}`)
    process.exit(1)
  }

  if (status) {
    process.exit(status)
  }
}

const [command] = process.argv.slice(2)

switch (command) {
  case 'local': {
    const { params } = parseEnvData()
    sam(['local', 'start-api', '--port', `${params.port || DEFAULT_PORT}`, ...getParameterOverrides()])
    break
  }

  case 'deploy': {
    sam(['build'])
    sam(['deploy', ...getParameterOverrides()])
    break
  }

  default: {
    console.error('Usage: node scripts/sam.js <local|deploy> [--port=4000]')
    process.exit(1)
  }
}
