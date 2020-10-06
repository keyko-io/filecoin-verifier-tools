const MockWallet = require('../mockWallet')
const constants = require('../constants')

const mockWallet = new MockWallet(constants.verifier_mnemonic, constants.path)

console.log(mockWallet.getAccountInfo())
