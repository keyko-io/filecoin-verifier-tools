
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../../hamt/hamt')
// const CID = require('cids')
const fs = require('fs')
const methods = require('../../filecoin/methodsWallet')
const constants = require("../constants")

let endpointUrl = constants.lotus_endpoint
let tokenPath = constants.token_path 

const provider = new Provider(endpointUrl, {
    token: async () => {
        return fs.readFileSync(tokenPath)
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
    while (true) {
        const head = await client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        console.log("height", head.Height, state)
        const verifiers = (await client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
        let dta = methods.decode(schema, verifiers)
        console.log(await dta.asObject(load))
        console.log(await dta.find(load, "t01003"))
        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }
}

run()
