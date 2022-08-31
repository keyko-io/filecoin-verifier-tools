const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), mockWallet)

async function tSignRemoveDataCapProposal() {
  try {
    // console.log('started must specify notary address, client address, and allowance to remove')
    const res = await api.signRemoveDataCapProposal('t01004', 't01019', '600')
    console.log('RESULT:', res)
    process.exit(0)
  } catch (error) {
    console.log(error)
  }
}

tSignRemoveDataCapProposal()
