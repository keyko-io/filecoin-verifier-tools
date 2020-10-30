const MockWallet = require('../mockWallet')
const constants = require('../constants')

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

console.log(mockWallet.getAccountInfo())
