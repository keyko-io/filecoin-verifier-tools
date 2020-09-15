const fs = require('fs')
const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

async function run() {
  const endpointUrl = constants.lotus_endpoint
  const tokenPath = constants.token_path

  const mockWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

  const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
    token: async () => {
      return fs.readFileSync(tokenPath)
    },
  }), mockWallet)

  while (true) {
    var verifiers = await api.listVerifiers()
    var clients = await api.listVerifiedClients()

    console.log(verifiers, clients)

    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}

run()
