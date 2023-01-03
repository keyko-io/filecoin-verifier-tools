import MockWallet from '../mockWallet.js'
import { rootkey_mnemonic, path } from '../constants.js'

const mockWallet = new MockWallet(rootkey_mnemonic, path)

console.log(mockWallet.getAccountInfo())
// console.log(generateMnemonic())
