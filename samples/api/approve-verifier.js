const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require("@keyko-io/filecoin-signing-tools/js")
const methods = require('../../filecoin/methods')
const constants = require("../constants")
const VerifyAPI = require('../../api/api2.js')

let endpointUrl = constants.lotus_endpoint
let tokenPath = constants.token_path 

const provider = new Provider(endpointUrl, {
    token: async () => {
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.6k2jD5PiG3LcX91mnkgtzSarDds54N7WKqS_egBFdQ8"
    }
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })
const api = new VerifyAPI(client)



const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")
console.log("address", key.address)

async function main() {

    await api.approveVerifier("t01004", 100000000000000000000000000000000000000000n, "t01001", key)
    process.exit(0)

    /*
    console.log("here", methods.encodeAddVerifier("t01003", 100000000000000000000000000000000000000000n).params.toString("hex"))
    let add = methods.verifreg.addVerifier("t01003", 100000000000000000000000000000000000000000n)
    let tx = methods.rootkey.approve(0, {...add, from: "t01001"})
    console.log(tx)
   
    await methods.sendTx(client, key, tx)
    process.exit(0)
    */
}
    


main()
