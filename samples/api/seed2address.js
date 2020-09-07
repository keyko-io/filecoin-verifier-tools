const MockWallet = require('../mockWallet')

const mnemonic = 'sail surprise observe size vague cactus slice certain task target job bomb artefact jazz outside theme banner grow motor face mirror dry exact super'
const path = "m/44'/1'/1/0/"
const mockWallet = new MockWallet(mnemonic, path)

console.log(mockWallet.getAccounts())
