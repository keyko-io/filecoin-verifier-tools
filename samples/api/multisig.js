const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

async function run() {
  const endpointUrl = constants.lotus_endpoint

  const mockWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

  const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl), mockWallet)

  console.log(Buffer.from('') instanceof Buffer)

    let arg = process.argv[2]

    console.log(await api.multisigInfo(arg))
    console.log(await api.pendingTransactions(arg))
    process.exit(0)

}

run()
