const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

// const mnemonic = 'insane again foster foster garlic address stick caught style disorder fuel distance turtle actual clutch tilt spice lobster security rubber fog thank together bubble'
const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
const path = "m/44'/1'/1/0/"
const mockWallet = new MockWallet(mnemonic, path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  }
}), mockWallet)

async function main () {
  await api.proposeVerifier('t01004', 100000000000000000000000000000000000000000n, 2)
  process.exit(0)
}

main()
