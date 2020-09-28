const VerifyAPI = require('../../api/api.js')
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
  let accts = await mockWallet.getAccounts()
  console.log(accts)
  const textile = accts[3]
  const slate = accts[4]

  const m0_addr = await api.newMultisig([textile], 1, 3)
  console.log('M0', m0_addr)

  const m1_addr = await api.newMultisig([textile, slate], 2, 3)
  console.log('M1', m1_addr)

  // add this to M0
  let receipt3 = await api.multisigAdd(m0_addr, m1_addr, 3)
  console.log(receipt3)

  process.exit(0)
}

main()
