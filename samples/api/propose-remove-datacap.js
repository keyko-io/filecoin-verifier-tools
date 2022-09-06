const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')
const { acceleratedmobilepageurl } = require('googleapis/build/src/apis/acceleratedmobilepageurl')

const endpointUrl = constants.lotus_endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'

const rootkeyWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)
const verifiersWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), verifiersWallet)

async function removeDatacap() {
  try {
    // const accounts = await verifiersWallet.getAccounts()
    // const rkAccounts = await rootkeyWallet.getAccounts()
      // console.log('dc at start:', await api.checkClient('t01019'))
    // console.log("accounts",rkAccounts)
    // process.exit(0)

    // get signature manually in test node using: lotus filplus sign-remove-data-cap-proposal t01004 t01019 600
    const signature1 = '0140c597d471f0856d7a81e9a090b25d46a8be1dc297e8e57f36471e7a37f4ffc40c7cff3c061bcad9e5feb53ed70e18a8cc5402f961a67df7802aef919d87fe9a01'
    const signature2 = 
    '01649f17c1e9212a4155d94b1a947416c9a98463d72f40d65602e6b003ff086a992b0090fb94b18e85f6f6145a932fe577b206de275ed1a73a3938d822d71b5cfd00'

    const tx = await api.proposeRemoveDataCap('t01019', 1000, 't01004',signature1,'t01008',signature2, 2, rootkeyWallet)
    console.log('TX:',tx)
    process.exit(0)
    
  } catch (error) {
    console.log(error)
  }
}

removeDatacap()
