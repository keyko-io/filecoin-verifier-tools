const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
const path = "m/44'/1'/1/0/"
const mockWallet = new MockWallet(mnemonic, path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  }
}), mockWallet)

async function main () {
  await api.verifyClient(process.argv[2], 10000000000000000000000n, 2)
  process.exit(0)
}

main()
