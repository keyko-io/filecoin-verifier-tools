
const signer = require("@keyko-io/filecoin-signing-tools/js")
const cbor = require('cbor')
const hamt = require('../hamt/hamt')
const blake = require('blakejs')

async function signTx(client, indexAccount, walletContext, {to, method, params, value}) {
    const head = await client.chainHead()
    const address =  (await walletContext.getAccounts())[indexAccount]
    console.log("address form wallet: " + address)
   
    let state = await client.stateGetActor(address, head.Cids)
    // console.log("params", params)
    // console.log("state", state)
    let msg = {
        "to": to,
        "from": address,
        "nonce": state.Nonce,
        "value": "123456789",
        "gasprice": "1",
        "gaslimit": 25000000,
        "method": method,
        "params": params,
    }

     return walletContext.sign(msg, indexAccount)
     //return signer.transactionSignLotus(msg, key.private_hexstring)
}

async function sendTx(client, key, walletContext, obj) {
    let tx = await signTx(client, key, walletContext, obj)
    return await client.mpoolPush(JSON.parse(tx))
}

function pad(str) {
    if (str.length % 2 == 0) return str
    else return '0'+str
}

function encodeBig(bn) {
    if (bn.toString() === "0") return Buffer.from("")
    return Buffer.from('00' + pad(bn.toString(16)), 'hex')
}

async function sendVerify(verified, cap) {
    console.log([signer.addressAsBytes(verified), encodeBig(cap)])
    await sendTx("t06", 4, cbor.encode([signer.addressAsBytes(verified), encodeBig(cap)]))
}

function encodeSend(to) {
    return {
        to,
        method:0,
        params: "",
    }
}

function encodeAddVerifier(verified, cap) {
    return {
        to: "t06",
        method: 2,
        params: cbor.encode([signer.addressAsBytes(verified), encodeBig(cap)]),
    }
}

function encodeAddVerifiedClient(verified, cap) {
    return {
        to: "t06",
        method: 4,
        params: cbor.encode([signer.addressAsBytes(verified), encodeBig(cap)]),
    }
}

function encodePropose(msig, msg) {
    console.log("encpro", [signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
    return {
        to: msig,
        method: 2,
        params: cbor.encode([signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
    }
}

function encodeProposalHashdata(from, msg) {
    return cbor.encode([signer.addressAsBytes(from), signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
}

function encodeApprove(msig, txid, from, msg) {
    let hashData = encodeProposalHashdata(from, msg)
    let hash = blake.blake2bHex(hashData, null, 32)
    return {
        to: msig,
        method: 3,
        params: cbor.encode([txid, Buffer.from(hash, "hex")])
    }
}


function isType(schema) {
    if (schema === 'address' || schema === 'bigint' || schema === 'int' || schema === 'buffer') return true
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
    if (schema === 'int' || schema === 'buffer') {
        return data
    }
    if (schema.type === 'hash') {
        return data
    }
    if (schema.type === 'hamt') {
        return {
            find: async (lookup, key) => {
                let res = await hamt.find(data, lookup, encode(schema.key, key))
                return decode(schema.value, res)
            },
            asList: async (lookup) => {
                let res = []
                await hamt.forEach(data, lookup, async (k,v) => {
                    res.push([decode(schema.key, k), decode(schema.value, v)])
                })
                return res
            },
            asObject: async (lookup) => {
                let res = {}
                await hamt.forEach(data, lookup, async (k,v) => {
                    res[decode(schema.key, k)] = decode(schema.value, v)
                })
                return res
            },
        }
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
    if (typeof schema === 'object') {
        let res = {}
        let entries = Object.entries(schema)
        for (let i = 0; i < entries.length; i++) {
            res[entries[i][0]] = decode(entries[i][1], data[i])
        }
        return res
    }
    throw new Error(`Unknown type ${schema}`)
}

function encode(schema, data) {
    if (schema === 'address') {
        return signer.addressAsBytes(data)
    }
    if (schema === 'bigint') {
        return encodeBig(data)
    }
    if (schema === 'int' || schema === 'buffer') {
        return data
    }
    if (schema.type === 'hash') {
        let hashData = cbor.encode(encode(schema.input, data))
        let hash = blake.blake2bHex(hashData, null, 32)
        return Buffer.from(hash, "hex")
    }
    if (schema instanceof Array) {
        if (schema[0] === 'list') {
            return data.map(a => encode(schema[1], a))
        }
        if (schema[0] === 'cbor') {
            return cbor.encode(encode(schema[1], data))
        }
        if (schema.length != data.length) throw new Error("schema and data length do not match")
        let res = []
        for (let i = 0; i < data.length; i++) {
            res.push(encode(schema[i], data[i]))
        }
        return res
    }
    if (typeof schema === 'object') {
        let res = []
        let entries = Object.entries(schema)
        for (let i = 0; i < entries.length; i++) {
            let arg
            if (data instanceof Array) {
                arg = data[i]
            }
            else {
                arg = data[entries[i][0]]
            }
            res.push(encode(entries[i][1], arg))
        }
        return res
    }
    throw new Error(`Unknown type ${schema}`)
} 

function actor(address, spec) {
    let res = {}
    for (let [num, method] of Object.entries(spec)) {
        res[method.name] = function (data) {
            let params
            if (arguments.length > 1) {
                params = encode(method.input, Array.from(arguments))
            }
            else {
                params = encode(method.input, data)
            }
            console.log("params", params)
            return {
                to: address,
                value: 0n,
                method: parseInt(num),
                params: cbor.encode(params),
            }
        }
    }
    return res
}

let multisig = {
    3: {
        name: "approve",
        input: {
            id: "int",
            hash: {
                type: "hash",
                input: {
                    from: "address",
                    to: "address",
                    value: "bigint",
                    method: "int",
                    params: "buffer",
                }
            }
        }
    },
    2: {
        name: "propose",
        input: {
            to: "address",
            value: "bigint",
            method: "int",
            params: "buffer",
        }
    },
}

let verifreg = {
    2: {
        name: "addVerifier",
        input: {
            verifier: "address",
            cap: "bigint",
        }
    },
    4: {
        name: "addVerifiedClient",
        input: {
            address: "address",
            cap: "bigint",
        }
    }
}

module.exports = {
    encodeSend,
    encodeApprove,
    encodePropose,
    encodeAddVerifier,
    encodeAddVerifiedClient,
    sendTx,
    signTx,
    decode,
    encode,
    actor,
    multisig,
    rootkey: actor("t080", multisig),
    verifreg: actor("t06", verifreg),
}

