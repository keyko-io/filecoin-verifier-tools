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

const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")
console.log("address", key.address)

async function main() {
    console.log("here", methods.encodeAddVerifier("t01004", 100000000000000000000000000000000000000000n).params.toString("hex"))
    let arg = methods.encodePropose("t080", methods.encodeAddVerifier("t01004", 100000000000000000000000000000000000000000n))
    await methods.sendTx(client, key, arg)
    process.exit(0)
}

main()
