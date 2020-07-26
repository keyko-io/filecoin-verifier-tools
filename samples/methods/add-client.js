const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require("@keyko-io/filecoin-signing-tools/js")
const methods = require('../../filecoin/methods')
const constants = require("../constants")

let endpointUrl = constants.lotus_endpoint
let tokenPath = constants.token_path 

const provider = new Provider(endpointUrl, {token: async () => {
    return fs.readFileSync(tokenPath)
}})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

// console.log(signer.generateMnemonic())

const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")
console.log("address", key.address)

async function main() {
    let arg = methods.verifreg.addVerifiedClient("t1743zcvw32tdxumeln75e3pfcl43iy43k2fjdpza", 10000000000000000000000n)
    await methods.sendTx(client, key, arg)
    process.exit(0)
}

main()