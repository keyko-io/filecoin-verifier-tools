
const signer = require("@Zondax/filecoin-signing-tools")
const cbor = require('cbor')
const hamt = require('./hamt')
const blake = require('blakejs')

async function signTx(client, key, {to, method, params, value}) {
    const head = await client.chainHead()
    let state = await client.stateGetActor(key.address, head.Cids)
    // console.log("params", params)
    // console.log("state", state)
    let msg = {
        "to": to,
        "from": key.address,
        "nonce": state.Nonce,
        "value": "123456789",
        "gasprice": "0",
        "gaslimit": 25000,
        "method": method,
        "params": params,
    }
    return signer.transactionSignLotus(msg, key.private_hexstring)
}

async function sendTx(client, key, obj) {
    let tx = await signTx(client, key, obj)
    // console.log(tx)
    await client.mpoolPush(JSON.parse(tx))
}

function pad(str) {
    if (str.length % 2 == 0) return str
    else return '0'+str
}

function encodeBig(bn) {
    if (bn.toString() == 0) return Buffer.from("")
    return Buffer.from('00' + pad(bn.toString(16)), 'hex')
}

async function sendVerify(verified, cap) {
    console.log([signer.addressAsBytes(verified), encodeBig(cap)])
    await sendTx("t06", 4, cbor.encode([signer.addressAsBytes(verified), encodeBig(cap)]))
}

// sendTx("t17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy", 0, "")

// sendTx("t1uu7jrpff4sh7g2clfjv7oc2oafui5hrlxeuax7q", 123456789101112n)

function encodeSend(to) {
    return {
        to,
        method:0,
        params: "",
    }
}

function encodeAddVerifier(verified, cap) {
    // console.log("verifier", [signer.addressAsBytes(verified), encodeBig(cap)])
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
    return {
        to: msig,
        method: 2,
        params: cbor.encode([signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
    }
}

function encodeProposalHashdata(from, msg) {
    // console.log(from, msg.to)
    return cbor.encode([signer.addressAsBytes(from), signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
}

function encodeApprove(msig, txid, from, msg) {
    // console.log(from, msg)
    let hashData = encodeProposalHashdata(from, msg)
    let hash = blake.blake2bHex(hashData, null, 32)
    return {
        to: msig,
        method: 3,
        params: cbor.encode([txid, Buffer.from(hash, "hex")])
    }
}

// console.log(encodeAddVerifier("t01003", 7777777))
// console.log(encodePropose("t01006", encodeAddVerifier("t01003", 7777777)))

// sendTx(encodePropose("t01006", encodeAddVerifier("t01003", 7777777)))

// console.log(encodeProposalHashdata("t01003", encodeAddVerifier("t01003", 7777777)).toString("hex"))
// console.log(encodeApprove("t01006", 1, "t01007", encodeAddVerifier("t01005", 7777777)).toString("hex"))

async function main() {
    console.log(await signTx(encodeApprove("t01006", 1, "t01007", encodeAddVerifier("t01005", 7777777))))
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

// main()

module.exports = {
    encodeSend,
    encodeApprove,
    encodePropose,
    encodeAddVerifier,
    encodeAddVerifiedClient,
    sendTx,
    signTx,
    decode,
}

