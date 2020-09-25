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
  const lst = await api.listVerifiers()
  console.log(lst)
  for (const { verifier } of lst) {
    console.log(verifier, await api.checkVerifier(verifier))
  }
  console.log('t01010', await api.checkVerifier('t01010'))
  process.exit(0)
}

main()
