const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

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
    const signature1 = '013c225da5e6380774ef85cdc47266513e148ea7a167cd9a45b3baecb157dd30030a1179cd2aeee464af5264e1111d08ab27047b8effc75a9e91c6aa6a98a3012100'
    const signature2 =
    '0175d8950d29fc5224a6d873fe25cc7b0745be263209bd3b643eb625b35a6bbe7d4fa46eb71fe526dd09e9580409e90e79c934450054442a7c593b8f4bbf27636000'

    const tx = await api.proposeRemoveDataCap('t01019', 1000, 't01004', signature1, 't01001', signature2, 2, rootkeyWallet)
    console.log('TX:', tx)
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

removeDatacap()
