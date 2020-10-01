const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const methods = require('../../filecoin/methods').testnet
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
}), mockWallet)

async function main() {
  console.log('here', methods.encodeAddVerifier('t01003', 100000000000000000000000000000000000000000n).params.toString('hex'))

  await api.approveVerifier('t01003', 100000000000000000000000000000000000000000n, 't0101', 0, 2)
  process.exit(0)
}

main()
