const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

// const mnemonic = 'insane again foster foster garlic address stick caught style disorder fuel distance turtle actual clutch tilt spice lobster security rubber fog thank together bubble'
const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
}), mockWallet)

async function main() {
  await api.proposeVerifier(process.argv[2], 100000000000000000000000000000000000000000n, 2)
  process.exit(0)
}

main()
