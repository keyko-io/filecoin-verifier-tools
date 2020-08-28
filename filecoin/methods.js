
const signer = require('@zondax/filecoin-signing-tools')
const cbor = require('cbor')
const hamt = require('../hamt/hamt')
const blake = require('blakejs')
const address = require('@openworklabs/filecoin-address')

function bytesToAddress(payload, testnet) {
  const addr = new address.Address(payload)
  return address.encode(testnet ? 't' : 'f', addr)
}

async function signTx(client, indexAccount, walletContext, { to, method, params, value }) {
  const head = await client.chainHead()
  const address = (await walletContext.getAccounts())[indexAccount]
  console.log('address form wallet: ' + address)

  const state = await client.stateGetActor(address, head.Cids)
  // console.log("params", params)
  // console.log("state", state)
  const msg = {
    to: to,
    from: address,
    nonce: state.Nonce,
    value: value || '0',
    gasfeecap: '1000000000',
    gaspremium: '15000',
    gaslimit: 25000000,
    method: method,
    params: params,
  }

  return walletContext.sign(msg, indexAccount)
}

async function sendTx(client, indexAccount, walletContext, obj) {
  const tx = await signTx(client, indexAccount, walletContext, obj)
  console.log('going to send', tx)
  return await client.mpoolPush(JSON.parse(tx))
}

function pad(str) {
  if (str.length % 2 === 0) return str
  else return '0' + str
}

function encodeBig(bn) {
  if (bn.toString() === '0') return Buffer.from('')
  return Buffer.from('00' + pad(bn.toString(16)), 'hex')
}

/*
async function sendVerify (verified, cap) {
  // console.log([signer.addressAsBytes(verified), encodeBig(cap)])
  await sendTx('t06', 4, cbor.encode([signer.addressAsBytes(verified), encodeBig(cap)]))
}
*/

function encodeSend(to) {
  return {
    to,
    method: 0,
    params: '',
    value: 0n,
  }
}

function encodeAddVerifier(verified, cap) {
  return {
    to: 't06',
    method: 2,
    params: cbor.encode([signer.addressAsBytes(verified), encodeBig(cap)]),
    value: 0n,
  }
}

function encodeAddVerifiedClient(verified, cap) {
  return {
    to: 't06',
    method: 4,
    params: cbor.encode([signer.addressAsBytes(verified), encodeBig(cap)]),
    value: 0n,
  }
}

function encodePropose(msig, msg) {
  // console.log("encpro", [signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
  return {
    to: msig,
    method: 2,
    params: cbor.encode([signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params]),
    value: 0n,
  }
}

function encodeProposalHashdata(from, msg) {
  return cbor.encode([signer.addressAsBytes(from), signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
}

function encodeApprove(msig, txid, from, msg) {
  const hashData = encodeProposalHashdata(from, msg)
  const hash = blake.blake2bHex(hashData, null, 32)
  return {
    to: msig,
    method: 3,
    params: cbor.encode([txid, Buffer.from(hash, 'hex')]),
    value: 0n,
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
  if (schema === 'address' && typeof data === 'string') {
    return bytesToAddress(Buffer.from(data, 'base64'), true)
  }
  if (schema === 'address') {
    return bytesToAddress(data, true)
  }
  if (schema === 'bigint') {
    return hamt.bytesToBig(data)
  }
  if (schema === 'bigint-signed') {
    return hamt.bytesToBig(data) / 2n
  }
  if (schema === 'int' || schema === 'buffer' || schema === 'bool') {
    return data
  }
  if (schema === 'cid') {
    return data['/']
  }
  if (schema.type === 'hash') {
    return data
  }
  if (schema.type === 'hamt') {
    return {
      find: async (lookup, key) => {
        const res = await hamt.find(data, lookup, encode(schema.key, key))
        return decode(schema.value, res)
      },
      asList: async (lookup) => {
        const res = []
        await hamt.forEach(data, lookup, async (k, v) => {
          res.push([decode(schema.key, k), decode(schema.value, v)])
        })
        return res
      },
      asObject: async (lookup) => {
        const res = {}
        await hamt.forEach(data, lookup, async (k, v) => {
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
    if (schema.length !== data.length) throw new Error('schema and data length do not match')
    if (isType(schema[0])) {
      const res = []
      for (let i = 0; i < data.length; i++) {
        res.push(decode(schema[i], data[i]))
      }
      return res
    }
    const res = {}
    for (let i = 0; i < data.length; i++) {
      res[schema[i][0]] = decode(schema[i][1], data[i])
    }
    return res
  }
  if (typeof schema === 'object') {
    const res = {}
    const entries = Object.entries(schema)
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
  if (schema === 'int' || typeof data === 'string') {
    return parseInt(data)
  }
  if (schema === 'int' || schema === 'buffer') {
    return data
  }
  if (schema.type === 'hash') {
    const hashData = cbor.encode(encode(schema.input, data))
    const hash = blake.blake2bHex(hashData, null, 32)
    return Buffer.from(hash, 'hex')
  }
  if (schema instanceof Array) {
    if (schema[0] === 'list') {
      return data.map(a => encode(schema[1], a))
    }
    if (schema[0] === 'cbor') {
      return cbor.encode(encode(schema[1], data))
    }
    if (schema.length !== data.length) throw new Error('schema and data length do not match')
    const res = []
    for (let i = 0; i < data.length; i++) {
      res.push(encode(schema[i], data[i]))
    }
    return res
  }
  if (typeof schema === 'object') {
    const res = []
    const entries = Object.entries(schema)
    for (let i = 0; i < entries.length; i++) {
      let arg
      if (data instanceof Array) {
        arg = data[i]
      } else {
        arg = data[entries[i][0]]
      }
      res.push(encode(entries[i][1], arg))
    }
    return res
  }
  throw new Error(`Unknown type ${schema}`)
}

function actor(address, spec) {
  const res = {}
  for (const [num, method] of Object.entries(spec)) {
    res[method.name] = function (data) {
      let params
      if (arguments.length > 1) {
        params = encode(method.input, Array.from(arguments))
      } else {
        params = encode(method.input, data)
      }
      // console.log("params", params)
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

const multisig = {
  3: {
    name: 'approve',
    input: {
      id: 'int',
      hash: {
        type: 'hash',
        input: {
          from: 'address',
          to: 'address',
          value: 'bigint',
          method: 'int',
          params: 'buffer',
        },
      },
    },
  },
  2: {
    name: 'propose',
    input: {
      to: 'address',
      value: 'bigint',
      method: 'int',
      params: 'buffer',
    },
  },
}

const pending = {
  type: 'hamt',
  key: 'bigint-signed',
  value: {
    to: 'address',
    value: 'bigint',
    method: 'int',
    params: 'buffer',
    signers: ['list', 'address'],
  },
}

const verifreg = {
  2: {
    name: 'addVerifier',
    input: {
      verifier: 'address',
      cap: 'bigint',
    },
  },
  4: {
    name: 'addVerifiedClient',
    input: {
      address: 'address',
      cap: 'bigint',
    },
  },
}

const reg = {
  t080: multisig,
  t06: verifreg,
}

function parse(tx) {
  try {
    const actor = reg[tx.to]
    const { name, input } = actor[tx.method]
    return { name, params: decode(input, cbor.decode(tx.params)) }
  } catch (err) {
    return null
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
  pending,
  rootkey: actor('t080', multisig),
  verifreg: actor('t06', verifreg),
  parse,
}
