const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require('@zondax/filecoin-signing-tools')
const methods = require('../filecoin/methods')
const MockWallet = require('./mockWallet')

const endpointUrl = 'ws://localhost:1234/rpc/v0'
const provider = new Provider(endpointUrl, {
  token: async () => {
    return fs.readFileSync('/home/sami/.lotus/token')
  },
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
const mockWallet = new MockWallet(mnemonic, "m/44'/1'/1/0/")

const key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", '')
console.log('address', key.address)

async function main() {
  await methods.sendTx(client, 2, mockWallet, methods.encodeSend('t01000'))
  process.exit(0)
}

main()
