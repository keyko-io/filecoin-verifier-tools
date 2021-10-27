const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

async function run() {
  const endpointUrl = constants.lotus_endpoint

  const mockWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

  const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl), mockWallet)

  console.log(Buffer.from('') instanceof Buffer)

  const info = await api.pendingRootTransactions()
  console.log(info)

  console.log(await api.listVerifiers())

  console.log(await api.listRootkeys())

  console.log(await api.multisigInfo('t080'))
  console.log(await api.pendingTransactions('t080'))

  process.exit(0)
}

run()
