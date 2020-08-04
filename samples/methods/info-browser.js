
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { BrowserProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const methods = require('../../filecoin/methods')
const signer = require("@keyko-io/filecoin-signing-tools/js")
const constants = require("../constants")

let endpointUrl = constants.lotus_endpoint
let tokenPath = constants.token_path 

const provider = new Provider(endpointUrl, {
    token: async () => {
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.JPoCyZQKwHGB2OkXQs17wQW4qKFXtow9-t8d85dm3go"
    }
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

async function load(a) {
    let res = await client.chainGetNode(a)
    return res.Obj
}

let schema = {
    type: "hamt",
    key: "address",
    value: "bigint",
}

async function run() {
    const elem = document.getElementById('info')
    while (true) {
        const head = await client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        const verifiers = (await client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
        let dta = methods.decode(schema, verifiers)
        let res = ""
        for (let [k,v] of await dta.asList(load)) {
            res += `<p>${k}: ${v.toString(10)}</p>`
        }
        elem.innerHTML = res
        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }
}

run()

const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")
console.log("address", key.address)

window.addVerifiedClient = async function () {
    let address = document.getElementById("address").value
    let arg = methods.verifreg.addVerifiedClient(address, 10000000000000000000000n)
    await methods.sendTx(client, key, arg)
}

