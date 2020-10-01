const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const methods = require('../../filecoin/methods').testnet
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
  const lst = await api.pendingRootTransactions()
  console.log(mockWallet.getAccounts())
  for (const { tx, id } of lst) {
    await api.send(methods.rootkey.approve(id, tx), 2)
  }
  process.exit(0)
}

main()
