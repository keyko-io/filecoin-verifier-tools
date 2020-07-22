
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt')
const methods = require('../methods')
// const CID = require('cids')
const fs = require('fs')

const endpointUrl = 'ws://localhost:1234/rpc/v0'
const provider = new Provider(endpointUrl, {
    token: async () => {
        return fs.readFileSync('/home/sami/.lotus/token')
    }
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

async function load(a) {
    let res = await client.chainGetNode(a)
    return res.Obj
}

let spec = [
    ["target", "address"],
    ["sent", "bigint"],
    ["method", "int"],
    ["params", ["cbor", [["verifier", "address"], ["cap", "bigint"]]]],
    ["signers", ["list", "address"]],
]


async function run() {
    while (true) {
        const head = await client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        console.log("height", head.Height, state)
        const data = (await client.chainGetNode(`${state}/@Ha:t0101/1/6`)).Obj
        console.log(JSON.stringify(data, null, 2))
        await hamt.forEach(data, load, function (k, v) {
            console.log("key", hamt.readVarInt(k) / 2n, methods.decode(spec, v))
        })
        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }
}

run()
