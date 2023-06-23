const VerifyAPI = require('../../../lib/api/api')
// const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'

const verifiersWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

// const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
//   token,
// }), verifiersWallet)
const api = new VerifyAPI.VerifyAPI(VerifyAPI.VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), verifiersWallet)

async function removeDatacap() {
  try {
  
    const encoded =  api.encodeRemoveDataCapParameters(["t01004",158856254,1256])
    console.log(encoded.toString('hex'))
    // console.log('encoded:', encoded[0].toString('hex'), encoded[1].toString('hex'), encoded[2].toString('hex'))
    //datacap 000977f43e  ok!!!
    //address 00ec07
    //id 0004e8


    console.log('834300ec0745000977f43e811904e8')
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

removeDatacap()
