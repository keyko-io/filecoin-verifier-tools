const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const mockWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
}), mockWallet)

async function main() {
  const id = await api.verifyClient(process.argv[2], 10000000000000000000000n, 2, mockWallet)
  console.log('sent transaction', id)
  const receipt = await api.getReceipt(id)
  console.log('got receipt', receipt)
  process.exit(0)
}

main()
