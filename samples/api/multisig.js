const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

async function run() {
  const endpointUrl = constants.lotus_endpoint

  const mockWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

  const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl), mockWallet)

  console.log(Buffer.from('') instanceof Buffer)

  while (true) {
    /*
    const info = await api.pendingRootTransactions()
    console.log(info)

    console.log(await api.listVerifiers())

    console.log(await api.listRootkeys())
    */
    let arg = process.argv[2]

    console.log(await api.multisigInfo(arg))
    console.log(await api.pendingTransactions(arg))

    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}

run()
