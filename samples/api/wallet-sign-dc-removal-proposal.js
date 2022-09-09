const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), mockWallet)

async function tsignDatacapRemoval() {
  try {
    const rkAccounts = await mockWallet.getAccounts()
    // console.log('accounts', rkAccounts)
    // process.exit(0)

    const res = await api.signDatacapRemoval('t01004', 1000, 't01019', mockWallet, 0)

    console.log('RESULT SIGNATURE:', res)
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

tsignDatacapRemoval()
