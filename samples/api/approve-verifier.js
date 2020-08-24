const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const methods = require('../../filecoin/methods')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
const path = "m/44'/1'/1/0/"
const mockWallet = new MockWallet(mnemonic, path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
}), mockWallet)

async function main () {
  console.log('here', methods.encodeAddVerifier('t01003', 100000000000000000000000000000000000000000n).params.toString('hex'))

  await api.approveVerifier('t01003', 100000000000000000000000000000000000000000n, 't0101', 0, 2)
  process.exit(0)
}

main()
