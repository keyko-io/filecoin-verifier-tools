const MockWallet = require('../mockWallet')
const constants = require('../constants')

const mockWallet = new MockWallet(constants.nerpa_mnemonic, constants.path)

console.log(mockWallet.getAccountInfo())
