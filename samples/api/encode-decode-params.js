const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')
const methods = require('../../filecoin/methods')
const { acceleratedmobilepageurl } = require('googleapis/build/src/apis/acceleratedmobilepageurl')
const { hex } = require('cbor/lib/utils')

const endpointUrl = constants.lotus_endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'

const rootkeyWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)
const verifiersWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), verifiersWallet)

async function removeDatacap() {
  try {
    const addressToRemoveDcFrom = 't01019'
    const t06 = 't06'
    const datacapToRemove = 1000

    // console.log("methods:",methods)
    // console.log("addressToRemoveDcFrom:",methods.testnet.encode('address',addressToRemoveDcFrom))
    // console.log("t06encoded:",methods.testnet.encode('address',t06))
    // console.log("datacapToRemove:", methods.testnet.encode('bigint',datacapToRemove))

    const signature1 = '019c5b9cbdf04f8f33c9191601f4c444e146d426db192244555ef1f0e70037d5a52be9d27955823d00367fda28e729f3a56a30d348956edd6b74d204fc9d39f72c00'
    const signature2 = '01e0868a38ced78ce20f2aca96506702fc5e7cb84b5a3b15ee40190eac7a202d1c3fdb0a2f391ea00190ae99094f39635ad8ced0fe96988945d8e14ed855840fa600'

    // console.log("signature1:", methods.testnet.encode('signature',signature1))
    console.log("signature1:", hex(signature1))

    process.exit(0)
    
  } catch (error) {
    console.log(error)
  }
}

removeDatacap()
