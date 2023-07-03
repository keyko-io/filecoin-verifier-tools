const VerifyAPI = require('../../../lib/api/api')
// const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'

const verifiersWallet = new MockWallet(constants.verifier_mnemonic, constants.path)
const api = new VerifyAPI.VerifyAPI(VerifyAPI.VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), verifiersWallet)

const bytes_array_to_compare = [102, 105, 108, 95, 114, 101, 109, 111, 118, 101, 100, 97, 116, 97, 99, 97, 112, 58, 131, 66, 0, 102, 70, 0, 8, 0, 0, 0, 0, 129, 0]

const hexStringToCompare = '66696c5f72656d6f7665646174616361703a83420066460008000000008100'

async function removeDatacap() {
  try {
    const params = { verifiedClient: 't0102', dataCapAmount: 34359738368, removalProposalID: [0] }
    const encoded_object = api.encodeRemoveDataCapParameters(params)

    console.log(hexStringToCompare)
    console.log(encoded_object)
    console.log('\n')
    console.log('is the txBlob correct?', encoded_object === hexStringToCompare)

    console.log('is the bytes array correct?', compareStringToBytesArray(encoded_object, bytes_array_to_compare))
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

function compareStringToBytesArray(string, compareArray) {
  const pairs = string.match(/.{1,2}/g)
  // console.log(pairs)

  const byteArray = []
  for (let i = 0; i < pairs.length; i++) {
    const byte = parseInt(pairs[i], 16)
    byteArray.push(byte)
  }

  // console.log(byteArray);
  // console.log(compareArray);
  const hasSameLength = byteArray.length === compareArray.length
  const everyValueIsSame = byteArray.every((elem, i) => elem === compareArray[i])

  return hasSameLength && everyValueIsSame
}

removeDatacap()
