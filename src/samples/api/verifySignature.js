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
    const encoded_object = api.encodeRemoveDataCapParameters({ verifiedClient: 't0102', dataCapAmount: 34359738368, removalProposalID: [0] })
    // console.log("encoded_object",encoded_object)
    // console.log('\n')

    // const prefix = Buffer.from("fil_removedatacap:").toString('hex')
    // console.log("prefix",prefix)
    // console.log('\n')

    // const encoded_string_hex = encoded_object.toString('hex')
    // console.log("encoded_string_hex",encoded_string_hex)
    // console.log('\n')

    // const full_buff = prefix.concat(encoded_string_hex)
    // console.log("full_buff",full_buff)
    // console.log('\n')

    console.log('66696c5f72656d6f7665646174616361703a83420066460008000000008100')
    console.log(encoded_object)
    console.log('\n')
    console.log(encoded_object === '66696c5f72656d6f7665646174616361703a83420066460008000000008100')
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

removeDatacap()
