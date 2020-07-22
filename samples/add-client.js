const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require("@Zondax/filecoin-signing-tools")
const methods = require('../methods')

const endpointUrl = 'ws://localhost:1234/rpc/v0'
const provider = new Provider(endpointUrl, {token: async () => {
    return fs.readFileSync('/home/sami/.lotus/token')
}})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

// console.log(signer.generateMnemonic())

const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")
console.log("address", key.address)

async function main() {
    let arg = methods.verifreg.addVerifiedClient(process.argv[2], 10000000000000000000000n)
    await methods.sendTx(client, key, arg)
    process.exit(0)
}

main()
