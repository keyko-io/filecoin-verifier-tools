
const signer = require('@zondax/filecoin-signing-tools/js')
const cbor = require('cbor')
const hamt = require('../hamt/hamt')
const blake = require('blakejs')
const address = require('@glif/filecoin-address')
const CID = require('cids')
const multihashes = require('multihashes')

function cborEncode(...obj) {
  const enc = new cbor.Encoder()
  enc.addSemanticType(Buffer, enc._pushBuffer)
  return enc._encodeAll(obj)
}

function make(testnet) {
  function bytesToAddress(payload) {
    const addr = new address.Address(payload)
    return address.encode(testnet ? 't' : 'f', addr)
  }

  function addressAsBytes(str) {
    return Buffer.from((address.newFromString(str)).str, 'binary')
  }

  async function signTx(client, indexAccount, walletContext, tx) {
    const head = await client.chainHead()
    const address = (await walletContext.getAccounts())[indexAccount]

    const nonce = await client.mpoolGetNonce(address)
    // console.log(nonce)

    // OLD CODE WITH 0.1FIL HARDCODED MAXFEE
    const estimation_msg = {
      To: tx.to,
      From: address,
      Nonce: nonce,
      Value: tx.value.toString() || '0',
      GasFeeCap: '0',
      GasPremium: '0',
      GasLimit: tx.gas || 0,
      Method: tx.method,
      Params: tx.params.toString('base64'),
    }

    console.log(estimation_msg)
    const res = await client.gasEstimateMessageGas(estimation_msg, { MaxFee: '100000000000000000' }, head.Cids)
    console.log(res)

    const msg = {
      to: tx.to,
      from: address,
      nonce: nonce,
      value: tx.value.toString() || '0',
      gasfeecap: res.GasFeeCap,
      gaspremium: res.GasPremium,
      gaslimit: res.GasLimit,
      method: tx.method,
      params: tx.params,
    }
    const sign = walletContext.sign(msg, indexAccount)
    return sign
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

  async function getMessage(client, cid) {
    try {
      const res = await client.chainGetMessage({ '/': cid })
      return res
    } catch (error) {
      // console.log(error)
    }
  }

  async function stateWaitMsg(client, cid) {
    try {
      const res = await client.stateWaitMsg({ '/': cid }, 1)
      return res
    } catch (error) {
      //  console.log(error)
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

  function encodeSend(to, params = '') {
    return {
      to,
      method: 0,
      params: params ? cborEncode(params) : '',
      value: 0n,
    }
  }

  const VERIFREG = testnet ? 't06' : 'f06'
  const INIT_ACTOR = testnet ? 't01' : 'f01'
  const ROOTKEY = testnet ? 't080' : 'f080'

  function encodeAddVerifier(verified, cap) {
    return {
      to: VERIFREG,
      method: 2,
      params: cborEncode([signer.addressAsBytes(verified), encodeBig(cap)]),
      value: 0n,
    }
  }

  function encodeAddVerifiedClient(verified, cap) {
    return {
      to: VERIFREG,
      method: 4,
      params: cborEncode([signer.addressAsBytes(verified), encodeBig(cap)]),
      value: 0n,
    }
  }

  function encodePropose(msig, msg) {
    // console.log("encpro", [signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
    return {
      to: msig,
      method: 2,
      params: cborEncode([signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params]),
      value: 0n,
    }
  }

  function encodeProposalHashdata(from, msg) {
    return cborEncode([signer.addressAsBytes(from), signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
  }

  function encodeApprove(msig, txid, from, msg) {
    const hashData = encodeProposalHashdata(from, msg)
    const hash = blake.blake2bHex(hashData, null, 32)
    return {
      to: msig,
      method: 3,
      params: cborEncode([txid, Buffer.from(hash, 'hex')]),
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
    if (schema === 'address' && data['/']) {
      return bytesToAddress(Buffer.from(data['/'].bytes, 'base64'), true)
    }
    if (schema === 'address') {
      return bytesToAddress(data, true)
    }
    if (schema === 'bigint' && typeof data === 'string') {
      return hamt.bytesToBig(Buffer.from(data, 'base64'))
    }
    if (schema === 'bigint' && data['/']) {
      return hamt.bytesToBig(Buffer.from(data['/'].bytes, 'base64'))
    }
    if (schema === 'bigint') {
      return hamt.bytesToBig(data)
    }
    if (schema === 'bigint-signed') {
      return hamt.bytesToBig(data) / 2n
    }
    if (schema === 'bigint-key') {
      return hamt.readVarInt(data) / 2n
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
    if (schema === 'bigint-signed') {
      return encodeBigKey(data)
    }
    if (schema === 'bigint-key') {
      return encodeBigKey(data)
    }
    if (schema === 'int' || typeof data === 'string' && schema !== 'signature') {
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
      const hashData = cborEncode(encode(schema.input, data))
      const hash = blake.blake2bHex(hashData, null, 32)
      return Buffer.from(hash, 'hex')
    }
    if (schema === 'signature') {
      return Buffer.from(data, 'hex')
    }
    if (schema instanceof Array) {
      if (schema[0] === 'list') {
        return data.map(a => encode(schema[1], a))
      }
      if (schema[0] === 'cbor') {
        return cborEncode(encode(schema[1], data))
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
        return {
          to: address,
          value: 0n,
          method: parseInt(num),
          params: cborEncode(params),
        }
      }
    }
    return res
  }

  const verifreg = {
    2: {
      name: 'addVerifier',
      input: {
        verifier: 'address',
        cap: 'bigint',
      },
    },
    3: {
      name: 'removeVerifier',
      input: 'address',
    },
    4: {
      name: 'addVerifiedClient',
      input: {
        address: 'address',
        cap: 'bigint',
      },
    },
    7: {
      name: 'removeVerifiedClientDataCap',
      input: {
        verifiedClientToRemove: 'address',
        dataCapAmountToRemove: 'bigint',
        verifierRequest1: {
          verifier: 'address',
          signature: 'signature',
        },
        verifierRequest2: {
          verifier: 'address',
          signature: 'signature',
        },
      },
    },
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
    startEpoch: 'int',
  }]

  const pending = {
    type: 'hamt',
    key: 'bigint-key',
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

  const table = {
    type: 'hamt',
    key: 'address',
    value: 'bigint',
  }

  const verifreg_state = {
    rootkey: 'address',
    verifiers: ['ref', table],
    clients: ['ref', table],
  }

  const REMOVE_DATACAP_PROPOSAL = {
    removalProposalID: 'bigint',
    datacapAmount: 'bigint',
    verifiedClient: 'address',
  }

  const reg = {
    t080: multisig,
    t06: verifreg,
    t01: init,
    f080: multisig,
    f06: verifreg,
    f01: init,
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

  const multisigCID = new CID(1, 'raw', multihashes.encode(Buffer.from('fil/7/multisig'), 'identity'))

  async function buildArrayData(data, load) {
    var dataArray = []
    await hamt.forEach(data, load, function (k, v) {
      dataArray.push([bytesToAddress(k), hamt.bytesToBig(v)])
    })
    return dataArray
  }

  return {
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
    getMessage,
    stateWaitMsg,
    multisig,
    multisigCID,
    pending,
    rootkey: actor(ROOTKEY, multisig),
    verifreg: actor(VERIFREG, verifreg),
    init: actor(INIT_ACTOR, init),
    msig_constructor,
    msig_state,
    verifreg_state,
    parse,
    buildArrayData,
    ROOTKEY,
    VERIFREG,
    INIT_ACTOR,
    RemoveDataCapProposal: REMOVE_DATACAP_PROPOSAL,
    

  }
}

module.exports = {
  mainnet: make(false),
  testnet: make(true),
}
