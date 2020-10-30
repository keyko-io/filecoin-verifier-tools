const MockWallet = require('../mockWallet')
const constants = require('../constants')
const signer = require('@zondax/filecoin-signing-tools/js')

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

console.log(mockWallet.getAccountInfo())
console.log(signer.generateMnemonic())
