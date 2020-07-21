
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt')
// const CID = require('cids')
const fs = require('fs')
const varint = require('varint')
const signer = require("@Zondax/filecoin-signing-tools")
const cbor = require('cbor')

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

function isType(schema) {
    if (schema === 'address' || schema === 'bigint' || schema === 'int') return true
    if (schema instanceof Array) {
        if (schema[0] === 'list' || schema[0] === 'cbor') return true
    }
    return false
}

function decode(schema, data) {
    if (schema === 'address') {
        return signer.bytesToAddress(data, true)
    }
    if (schema === 'bigint') {
        return hamt.bytesToBig(data)
    }
    if (schema === 'int') {
        return data
    }
    if (schema instanceof Array) {
        if (schema[0] === 'list') {
            return data.map(a => decode(schema[1], a))
        }
        if (schema[0] === 'cbor') {
            return decode(schema[1], cbor.decode(data))
        }
        if (schema.length != data.length) throw new Error("schema and data length do not match")
        if (isType(schema[0])) {
            let res = []
            for (let i = 0; i < data.length; i++) {
                res.push(decode(schema[i], data[i]))
            }
            return res
        }
        let res = {}
        for (let i = 0; i < data.length; i++) {
            res[schema[i][0]] = decode(schema[i][1], data[i])
        }
        return res
    }
    throw new Error(`Unknown type ${schema}`)
}

async function run() {
    while (true) {
        const head = await client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        console.log("height", head.Height, state)
        const data = (await client.chainGetNode(`${state}/@Ha:t0101/1/6`)).Obj
        console.log(JSON.stringify(data, null, 2))
        await hamt.forEach(data, load, function (k, v) {
            console.log("key", hamt.readVarInt(k) / 2n, decode(spec, v))
        })
        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }
}

run()
