const fs = require('fs')
const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')
async function run() {
  const endpointUrl = constants.lotus_endpoint
  const tokenPath = constants.token_path
  const mockWallet = new MockWallet(constants.verifier_mnemonic, constants.path)
  const api = new VerifyAPI(VerifyAPI.standAloneProvider("https://node.glif.io/space06/lotus/rpc/v0"
    , {
    token: async () => {
        return ""
    }}), mockWallet)
  while (true) {
    var verifiers = await api.listVerifiers()
    var clients = await api.listVerifiedClients()
    console.log(verifiers, clients)
    //console.log('actor', await api.actorAddress('t1cncuf2kvfzsmsij3opaypup527ounnpwhiicdci'))
    //console.log('actor', await api.actorKey('t0102'))
    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}
run()