
const signer = require('@zondax/filecoin-signing-tools/js')
const cbor = require('cbor')
const hamt = require('../hamt/hamt')
const blake = require('blakejs')
const address = require('@openworklabs/filecoin-address')
const CID = require('cids')
const multihashes = require('multihashes')

function bytesToAddress(payload, testnet) {
  const addr = new address.Address(payload)
  return address.encode(testnet ? 't' : 'f', addr)
}

function addressAsBytes(str) {
  return Buffer.from((address.newFromString(str)).str, 'binary')
}

async function signTx(client, indexAccount, walletContext, { to, method, params, value }) {
  const head = await client.chainHead()
  const address = (await walletContext.getAccounts())[indexAccount]

  const state = await client.stateGetActor(address, head.Cids)
  let nonce = state.Nonce
  const pending = await client.mpoolPending(head.Cids)
  for (const {Message: tx} of pending) {
    if (tx.From === address && tx.Nonce + 1 > nonce) {
      nonce = tx.Nonce + 1
    }
  }
  const estimation_msg = {
    To: to,
    From: address,
    Nonce: nonce,
    Value: value.toString() || '0',
    GasFeeCap: '0',
    GasPremium: '0',
    GasLimit: 0,
    Method: method,
    Params: params.toString('base64'),
  }

  console.log(estimation_msg)

  const res = await client.gasEstimateMessageGas(estimation_msg, { MaxFee: '10000000000000000' }, head.Cids)
  console.log(res)

  const msg = {
    to: to,
    from: address,
    nonce: nonce,
    value: value.toString() || '0',
    gasfeecap: res.GasFeeCap,
    gaspremium: res.GasPremium,
    gaslimit: res.GasLimit,
    method: method,
    params: params,
  }

  return walletContext.sign(msg, indexAccount)
}

// returns tx hash
async function sendTx(client, indexAccount, walletContext, obj) {
  const tx = await signTx(client, indexAccount, walletContext, obj)
  console.log('going to send', tx)
  return await client.mpoolPush(JSON.parse(tx))
}

async function getReceipt(client, id) {
  while (true) {
    const res = await client.stateSearchMsg({ '/': id })
    if (res && res.Receipt) {
      return res.Receipt
    }
    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}

function pad(str) {
  if (str.length % 2 === 0) return str
  else return '0' + str
}

function encodeBig(bn) {
  if (bn.toString() === '0') return Buffer.from('')
  return Buffer.from('00' + pad(bn.toString(16)), 'hex')
}

function encodeBigKey(bn) {
  if (bn.toString() === '0') return Buffer.from('')
  return Buffer.from(pad(bn.toString(16)), 'hex')
}

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
  // console.log(schema, data)
  if (schema === 'address' && typeof data === 'string') {
    return bytesToAddress(Buffer.from(data, 'base64'), true)
  }
  if (schema === 'address') {
    return bytesToAddress(data, true)
  }
  if (schema === 'bigint' && typeof data === 'string') {
    return hamt.bytesToBig(Buffer.from(data, 'base64'))
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
  if (schema === 'cid' && data instanceof cbor.Tagged && data.tag === 42) {
    return new CID(data.value.slice(1))
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
    if (schema[0] === 'ref') {
      return async load => decode(schema[1], await load(data['/']))
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
    return addressAsBytes(data)
  }
  if (schema === 'bigint') {
    return encodeBig(data)
  }
  if (schema === 'bigint-key') {
    return encodeBigKey(data)
  }
  if (schema === 'int' || typeof data === 'string') {
    return parseInt(data)
  }
  if (schema === 'int' || schema === 'buffer') {
    return data
  }
  if (schema === 'cid') {
    return new cbor.Tagged(42, Buffer.concat([Buffer.from([0]), data.bytes]))
  }
  if (schema === 'bool') {
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
  4: {
    name: 'cancel',
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
  5: {
    name: 'addSigner',
    input: {
      signer: 'address',
      increase: 'bool',
    },
  },
  6: {
    name: 'removeSigner',
    input: {
      signer: 'address',
      decrease: 'bool',
    },
  },
  7: {
    name: 'swapSigner',
    input: {
      from: 'address',
      to: 'address',
    },
  },
  8: {
    name: 'changeNumApprovalsThreshold',
    input: {
      newThreshold: 'int',
    },
  },
}

const init = {
  2: {
    name: 'exec',
    input: {
      cid: 'cid',
      params: 'buffer',
    },
  },
}

const msig_constructor = ['cbor', {
  signers: ['list', 'address'],
  threshold: 'int',
  unlockDuration: 'int',
}]

const pending = {
  type: 'hamt',
  key: 'bigint',
  value: {
    to: 'address',
    value: 'bigint',
    method: 'int',
    params: 'buffer',
    signers: ['list', 'address'],
  },
}

const msig_state = {
  signers: ['list', 'address'],
  threshold: 'int',
  next_txn_id: 'int',
  initial_balance: 'bigint',
  start_epoch: 'int',
  unlock_duration: 'int',
  pending: ['ref', pending],
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
  t01: init,
}

function parse(tx) {
  try {
    const actor = reg[tx.to] || multisig
    const { name, input } = actor[tx.method]
    const params = decode(input, cbor.decode(tx.params))
    return { name, params, parsed: params && parse(params) }
  } catch (err) {
    return null
  }
}

const multisigCID = new CID(1, 'raw', multihashes.encode(Buffer.from('fil/1/multisig'), 'identity'))

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
  getReceipt,
  multisig,
  multisigCID,
  pending,
  rootkey: actor('t080', multisig),
  verifreg: actor('t06', verifreg),
  init: actor('t01', init),
  msig_constructor,
  msig_state,
  parse,
}
