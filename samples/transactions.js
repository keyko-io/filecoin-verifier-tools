
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
        return fs.readFileSync('/Users/jpfernandez/.lotus/token')
    }
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

async function load(a) {
    let res = await client.chainGetNode(a)
    return res.Obj
}

let message = {
    version: "int",
    to: "address",
    from: "address",
    nonce: "int",
    value: "bigint",
    gas_price: "bigint",
    gas_limit: "int",
    method: "int",
    params: "buffer",
}

async function handleMessages(i, dta) {
    if (dta[1] != 0) {
        // console.log(i, dta[2][2])
        for (let e of dta[2][2]) {
            const msg = (await client.chainGetNode(e['/'])).Obj
            if (msg.length == 2) {
                console.log(methods.decode(message, hamt.makeBuffers(msg[0])))
            }
            else {
                console.log(methods.decode(message, hamt.makeBuffers(msg)))
            }
        }
    }
}

async function handleReceipts(i, dta) {
    if (dta[1] != 0) {
        console.log(i, dta[2][2])
        for (let e of dta[2][2]) {
            /*
            const msg = (await client.chainGetNode(e['/'])).Obj
            if (msg.length == 2) {
                console.log(methods.decode(message, hamt.makeBuffers(msg[0])))
            }
            else {
                console.log(methods.decode(message, hamt.makeBuffers(msg)))
            }*/
        }
    }
}

async function run() {
    for (let i = 1; i < 1000; i++) {
        const ts = await client.chainGetTipSetByHeight(i, null)
        // const st = ts.Blocks[0].ParentStateRoot['/']
        let msg = ts.Blocks[0].Messages['/']
        const data = (await client.chainGetNode(msg)).Obj
        const d1 = (await client.chainGetNode(data[0]['/'])).Obj
        const d2 = (await client.chainGetNode(data[1]['/'])).Obj
        handleMessages(i, d1)
        handleMessages(i, d2)
    }
    /*
    for (let i = 1; i < 10000; i++) {
        const ts = await client.chainGetTipSetByHeight(i, null)
        // const st = ts.Blocks[0].ParentStateRoot['/']
        let msg = ts.Blocks[0].ParentMessageReceipts['/']
        const data = (await client.chainGetNode(msg)).Obj
        handleReceipts(i, data)
    }*/
    await client.destroy()
}

run()
