
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../../hamt/hamt')
const methods = require('../../filecoin/methods')
// const CID = require('cids')
const fs = require('fs')
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

async function run() {
    while (true) {
        const head = await client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        console.log("height", head.Height, state)
        const data = (await client.chainGetNode(`${state}/@Ha:t080/1/6`)).Obj
        console.log(JSON.stringify(data, null, 2))
        let info = methods.decode(methods.pending, data)
        let obj = await info.asObject(load)
        for (let [k,v] of Object.entries(obj)) {
            console.log(k, v, methods.parse(v))
        }
        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }
}

run()
