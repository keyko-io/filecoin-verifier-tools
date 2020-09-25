const VerifyAPI = require('../../api/api.js')
const methods = require('../../filecoin/methods.js')
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
  let m0_actor = methods.actor('t01022', methods.multisig)
  let m1_actor = methods.actor('t01023', methods.multisig)
  const tx = methods.verifreg.addVerifiedClient('t01012', 12340000000000n)
  console.log(tx)
  const tx2 = m0_actor.propose(tx)
  console.log(tx2)
  const tx3 = m1_actor.propose(tx2)
  console.log(tx3)
  await api.send(tx3, 4)
  process.exit(0)
}

main()
