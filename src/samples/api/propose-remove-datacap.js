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
    const accounts = await verifiersWallet.getAccounts()
    const rkAccounts = await rootkeyWallet.getAccounts()
    console.log(rkAccounts)

    // console.log('dc at start:', await api.checkClient('t01019'))
    // console.log("accounts",rkAccounts)
    // process.exit(0)
    //

    // remove 30000 from t01019: 5497558130000 
    


    // get signature manually in test node using: lotus filplus sign-remove-data-cap-proposal t01002 t01019 30000
    const signature1 = '01c3097afe1fbf931b54265983d5416fcf27035e1e87514d18a7bb27feb7596b8c1a0163f4f5f605168d49b98046516c8bda0a5100a0565c79dc3ee2e2e6ab96b300'
    const signature2 =
    '0162e9bad7a976b199e1e749240f83fedfd2b5b72417375629ba1955a240f2614922614349d652ec9a5fde8210417ba8db71ac058437d6fdb066c8b31318d39a9801'

    const tx = await api.proposeRemoveDataCap('t01019', 30000, 't01006', signature1, 't01002', signature2, 2, rootkeyWallet)
    // console.log('TX:', tx)
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

removeDatacap()
