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
  const msig = 't01013'
  const lst = await api.pendingTransactions(msig)

  for (const tx of lst) {
    console.log(tx)
    console.log(tx.parsed.parsed)
    await api.approvePending(msig, tx, 1)
  }

  process.exit(0)
}

main()
