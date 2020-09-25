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

  let lst = await api.pendingTransactions('t01023')

  console.log(lst)
  for (let tx of lst) {
    await api.send(m1_actor.approve(parseInt(tx.id), tx.tx), 3)
  }

  process.exit(0)
}

main()
