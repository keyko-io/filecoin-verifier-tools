const VerifyAPI = require('../../../lib/api/api')
// const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'

const rootkeyWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)
const verifiersWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

// const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
//   token,
// }), verifiersWallet)
const api = new VerifyAPI.VerifyAPI(VerifyAPI.VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), verifiersWallet)

async function removeDatacap() {
  try {
    // const accounts = await verifiersWallet.getAccounts()
    const rkAccounts = await rootkeyWallet.getAccounts()
    console.log(rkAccounts)

    // console.log('dc at start:', await api.checkClient('t01019'))
    // console.log("accounts",rkAccounts)
    // process.exit(0)
    //

    // remove 30000 from t01019: 5497558130000

    // get signature manually in test node using: lotus filplus sign-remove-data-cap-proposal t01002 t01019 30000
    const signature1 = '01965394a9a2497c3bb24da74216c393f7b2dbb782387a2cfb8d298cd3e864b8172d97f6ef6c8cb7f079c2af9d8f7290266e9a56850d278f26e9cfc46b3b801e3001'
    const signature2 =
    '0186d1b0ddae5921bf505c602ef3b8650fbfe355ffd95fd94f8c5e324c85d4de45269f1df837e1a0894c6e81ea83dd89bf1e570ba9b0e23d8fe4f07ab05c122c5901'

    const tx = await api.proposeRemoveDataCap('t01019', 222080, 't01004', signature1, 't01006', signature2, 2, rootkeyWallet)
    console.log('TX:', tx)
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

removeDatacap()
