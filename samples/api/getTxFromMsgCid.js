const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint

const token = constants.lotus_token

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token,
}), mockWallet)

async function main() {
  const tx = await api.getTxFromMsgCid('bafy2bzacecwcemtcctinqjjrjcnchds5ceiqaffac6vlp4mn5i4plsb5cohcw')
  console.log('TRANSACTION', tx)
}

main()
