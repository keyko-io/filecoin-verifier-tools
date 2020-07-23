const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require("@keyko-io/filecoin-signing-tools/js")
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
    console.log("here", methods.encodeAddVerifier("t01003", 100000000000000000000000000000000000000000n).params.toString("hex"))
    let add = methods.verifreg.addVerifier("t01003", 100000000000000000000000000000000000000000n)
    let tx = methods.rootkey.approve(0, {...add, from: "t01001"})
    console.log(tx)
    /*
    let arg = methods.encodeApprove("t080", 0, "t01001", methods.encodeAddVerifier("t01003", 100000000000000000000000000000000000000000n))
    console.log(arg.params.toString("hex"))
    console.log(tx.params.toString("hex"))
    console.log(arg)
    */
    await methods.sendTx(client, key, tx)
    process.exit(0)
}

main()
