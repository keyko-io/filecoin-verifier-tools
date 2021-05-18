const VerifyAPI = require('../../api/api')
const methods = require('../../filecoin/methods').testnet
const MockWallet = require('../mockWallet')
const fs = require('fs')
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
  console.log(methods.verifreg.removeVerifier(process.argv[2]).params.toString('hex'))
  const id = await api.removeVerifier(process.argv[2], 2)
  console.log(await api.getReceipt(id))
  process.exit(0)
}

main()
