'use strict';

var lotusClientSchema = require('@filecoin-shipyard/lotus-client-schema');
var signer = require('@zondax/filecoin-signing-tools/js');
var cbor = require('cbor');
var address = require('@glif/filecoin-address');
var jsSha256 = require('js-sha256');
var blake = require('blakejs');
var cid = require('multiformats/cid');
var multihashes = require('multihashes');
var lotusClientProviderBrowser = require('@filecoin-shipyard/lotus-client-provider-browser');
var lotusClientProviderNodejs = require('@filecoin-shipyard/lotus-client-provider-nodejs');
var lotusClientRpc = require('@filecoin-shipyard/lotus-client-rpc');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var signer__namespace = /*#__PURE__*/_interopNamespaceDefault(signer);
var address__namespace = /*#__PURE__*/_interopNamespaceDefault(address);

// Get n next bits
function nextBits(obj, n) {
  // if (obj.left < n) throw new Error("out of bits")
  const res = (obj.num >> BigInt(obj.left - n)) & BigInt((1 << n) - 1);
  obj.left -= n;
  return res
}

function indexForBitPos(bp, bitfield) {
  let acc = bitfield;
  let idx = 0;
  while (bp > 0) {
    if ((acc & 1n) === 1n) {
      idx++;
    }
    bp--;
    acc = acc >> 1n;
  }
  return idx
}

function getBit(b, n) {
  return Number((b >> n) & 0x1n)
}

async function getValue(n, load, hv, key) {
  const idx = nextBits(hv, n.bitWidth);
  if (getBit(n.data.bitfield, idx) === 0) {
    throw new Error('not found in bitfield')
  }

  const cindex = indexForBitPos(idx, n.data.bitfield);

  const c = n.data.pointers[cindex];

  if (c instanceof Array) {
    for (const [k, v] of c) {
      if (makeBuffers(k).toString() === makeBuffers(key).toString()) return makeBuffers(v)
    }
  } else {
    const child = await load(c['/']);
    return getValue({ bitWidth: n.bitWidth, data: parseNode(child) }, load, hv, key)
  }
  throw new Error('key not found')
}

function makeBuffers(obj) {
  if (typeof obj === 'string') {
    return Buffer.from(obj, 'base64')
  }
  if (obj['/'] && obj['/'].bytes) {
    return Buffer.from(obj['/'].bytes, 'base64')
  }
  if (obj instanceof Array) {
    return obj.map(makeBuffers)
  }
  return obj
}

async function forEachPrivate(n, load, cb) {
  for (const c of n.data.pointers) {
    if (c instanceof Array) {
      for (const [k, v] of c) {
        await cb(makeBuffers(k), makeBuffers(v));
      }
    } else {
      const child = await load(c['/']);
      await forEachPrivate({ bitWidth: n.bitWidth, data: parseNode(child) }, load, cb);
    }
  }
}

function bytesToBig(p) {
  let acc = 0n;
  for (let i = 0; i < p.length; i++) {
    acc *= 256n;
    acc += BigInt(p[i]);
  }
  return acc
}

function parseNode(data) {
  return {
    pointers: data[1],
    bitfield: bytesToBig(Buffer.from(data[0]['/'] ? data[0]['/'].bytes : data[0], 'base64')),
  }
}

const find = async function (data, load, key) {
  const hash = bytesToBig(Buffer.from(jsSha256.sha256(key), 'hex'));
  return getValue({ bitWidth: 5, data: parseNode(data) }, load, { num: hash, left: 256 }, key)
};

const forEach = async function (data, load, cb) {
  await forEachPrivate({ bitWidth: 5, data: parseNode(data) }, load, cb);
};

function readVarIntPrivate(bytes, offset) {
  let res = 0n;
  let acc = 1n;
  for (let i = offset; i < bytes.length; i++) {
    res += BigInt(bytes[i] & 0x7f) * acc;
    if (bytes[i] < 0x7f) {
      return res
    }
    acc *= 128n;
  }
  return res
}

const readVarInt = function (bytes, offset) {
  return readVarIntPrivate(bytes, offset || 0)
};

function cborEncode(...obj) {
  const enc = new cbor.Encoder();
  enc.addSemanticType(Buffer, enc._pushBuffer);
  return enc._encodeAll(obj)
}

function make(testnet) {
  function bytesToAddress(payload) {
    const addr = new address__namespace.Address(payload);
    return address__namespace.encode(testnet ? 't' : 'f', addr)
  }

  function addressAsBytes(str) {
    const nfs = address__namespace.newFromString(str);
    const res = Buffer.from(nfs.str, 'binary');
    return res
  }

  /*

  function min(a, b) {
    if (a < b) return a
    else return b
  }

  function max(a, b) {
    if (a > b) return a
    else return b
  }

  const gasOveruseNum = 11n
  const gasOveruseDenom = 10n

  function computeGasToBurn(gasUsed, gasLimit) {
    if (gasUsed === 0n) {
      return gasLimit
    }

    // over = gasLimit/gasUsed - 1 - 0.1
    // over = min(over, 1)
    // gasToBurn = (gasLimit - gasUsed) * over

    // so to factor out division from `over`
    // over*gasUsed = min(gasLimit - (11*gasUsed)/10, gasUsed)
    // gasToBurn = ((gasLimit - gasUsed)*over*gasUsed) / gasUsed
    const overuse = gasUsed * gasOveruseNum / gasOveruseDenom
    let over = gasLimit - overuse

    if (over < 0n) {
      return 0n
    }

    if (over > gasUsed) {
      over = gasUsed
    }

    return (gasLimit - gasUsed - over) / gasUsed
  }

  function gasCalcTxFee(
    gasFeeCap,
    gasPremium,
    gasLimit,
    baseFee,
    gasUsed,
  ) {
    // compute left side
    const totalGas = gasUsed + computeGasToBurn(gasUsed, gasLimit)
    const minBaseFeeFeeCap = min(baseFee, gasFeeCap)
    const leftSide = totalGas * minBaseFeeFeeCap

    // compute right side
    const minTip = min(gasFeeCap - baseFee, gasPremium)
    const rightSide = gasLimit * max(0n, minTip)

    return leftSide + rightSide
  }

  async function estimateGas(client, maxfee, { to, method, params, value, gas, nonce, from }) {
    const head = await client.chainHead()
    const baseFee = BigInt(head.Blocks[0].ParentBaseFee)

    const estimation_msg = {
      To: to,
      From: from,
      Nonce: nonce,
      Value: value.toString() || '0',
      GasFeeCap: '0',
      GasPremium: '0',
      GasLimit: gas || 0,
      Method: method,
      Params: params.toString('base64'),
    }

    const res = await client.gasEstimateMessageGas(estimation_msg, { MaxFee: maxfee.toString() }, head.Cids)
    // console.log(res)

    const msg = {
      to: to,
      from: from,
      nonce: nonce,
      value: value.toString() || '0',
      gasfeecap: res.GasFeeCap,
      gaspremium: res.GasPremium,
      gaslimit: res.GasLimit,
      method: method,
      params: params,
    }

    const msg2 = { ...msg, params: params.toString('base64') }

    const { ExecutionTrace: { MsgRct: { GasUsed } } } = await client.stateCall(msg2, head.Cids)
    const fee = gasCalcTxFee(BigInt(res.GasFeeCap), BigInt(res.GasPremium), BigInt(res.GasLimit), baseFee, BigInt(GasUsed))
    // console.log("got fee", fee)

    return [msg, fee]
  }

  async function iterateGas(client, msg) {
    let maxfee = BigInt(Math.pow(Number(BigInt(10)), Number(BigInt(10))))
    let saved_error
    const maxFeeComparison = BigInt(2) * BigInt(Math.pow(Number(BigInt(10)), Number(BigInt(18))))
    while (maxfee < maxFeeComparison) {
      try {
        maxfee = maxfee * 2n
        const [res, fee] = await estimateGas(client, maxfee, msg)
        const ratio = 100n * fee / maxfee
        console.log('fee', fee, 'max', maxfee, 'ratio', ratio)
        if (ratio < 10n) {
          return res
        }
      } catch (err) {
        saved_error = err
      }
    }
    throw saved_error
  }
  */

  async function signTx(client, indexAccount, walletContext, tx) {
    const head = await client.chainHead();
    const address = (await walletContext.getAccounts())[indexAccount];

    // const state = await client.stateGetActor(address, head.Cids)
    // let nonce = state.Nonce
    const nonce = await client.mpoolGetNonce(address);
    // console.log(nonce)
    // const pending = await client.mpoolPending(head.Cids)
    // for (const { Message: tx } of pending) {
    //   if (tx.From === address && tx.Nonce + 1 > nonce) {
    //     nonce = tx.Nonce + 1
    //   }
    // }
    /*
    console.log('Start estimnate gas...')
    const msg = await iterateGas(client, { ...tx, from: address, nonce })
    console.log('Estimate gas: ' + msg)

    return walletContext.sign(msg, indexAccount)
    */

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
    };

    console.log(estimation_msg);
    const res = await client.gasEstimateMessageGas(estimation_msg, { MaxFee: '100000000000000000' }, head.Cids);
    console.log(res);

    const msg = {
      to: tx.to,
      from: address,
      nonce,
      value: tx.value.toString() || '0',
      gasfeecap: res.GasFeeCap,
      gaspremium: res.GasPremium,
      gaslimit: res.GasLimit,
      method: tx.method,
      params: tx.params,
    };

    return walletContext.sign(msg, indexAccount)
  }

  // returns tx hash
  async function sendTx(client, indexAccount, walletContext, obj) {
    const tx = await signTx(client, indexAccount, walletContext, obj);
    console.log('going to send', tx);
    return await client.mpoolPush(JSON.parse(tx))
  }

  async function getReceipt(client, id) {
    while (true) {
      const res = await client.stateSearchMsg({ '/': id });
      if (res && res.Receipt) {
        return res.Receipt
      }
      await new Promise(resolve => { setTimeout(resolve, 1000); });
    }
  }

  async function getMessage(client, cid) {
    try {
      const res = await client.chainGetMessage({ '/': cid });
      return res
    } catch (error) {
      // console.log(error)
    }
  }

  async function stateWaitMsg(client, cid) {
    try {
      const res = await client.stateWaitMsg({ '/': cid }, 1);
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

  const VERIFREG = testnet ? 't06' : 'f06';
  const INIT_ACTOR = testnet ? 't01' : 'f01';
  const ROOTKEY = testnet ? 't080' : 'f080';

  function encodeAddVerifier(verified, cap) {
    return {
      to: VERIFREG,
      method: 2,
      params: cborEncode([signer__namespace.addressAsBytes(verified), encodeBig(cap)]),
      value: 0n,
    }
  }

  function encodeAddVerifiedClient(verified, cap) {
    return {
      to: VERIFREG,
      method: 4,
      params: cborEncode([signer__namespace.addressAsBytes(verified), encodeBig(cap)]),
      value: 0n,
    }
  }

  function encodePropose(msig, msg) {
    // console.log("encpro", [signer.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
    return {
      to: msig,
      method: 2,
      params: cborEncode([signer__namespace.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params]),
      value: 0n,
    }
  }

  function encodeProposalHashdata(from, msg) {
    return cborEncode([signer__namespace.addressAsBytes(from), signer__namespace.addressAsBytes(msg.to), encodeBig(msg.value || 0), msg.method, msg.params])
  }

  function encodeApprove(msig, txid, from, msg) {
    const hashData = encodeProposalHashdata(from, msg);
    const hash = blake.blake2bHex(hashData, null, 32);
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
      return bytesToAddress(Buffer.from(data, 'base64'))
    }
    if (schema === 'address' && data['/']) {
      return bytesToAddress(Buffer.from(data['/'].bytes, 'base64'))
    }
    if (schema === 'address') {
      return bytesToAddress(data)
    }
    if (schema === 'bigint' && typeof data === 'string') {
      return bytesToBig(Buffer.from(data, 'base64'))
    }
    if (schema === 'bigint' && data['/']) {
      return bytesToBig(Buffer.from(data['/'].bytes, 'base64'))
    }
    if (schema === 'bigint') {
      return bytesToBig(data)
    }
    if (schema === 'bigint-signed') {
      return bytesToBig(data) / 2n
    }
    if (schema === 'bigint-key') {
      return readVarInt(data) / 2n
    }
    if (schema === 'int' || schema === 'buffer' || schema === 'bool') {
      return data
    }
    if (schema === 'cid' && data instanceof cbor.Tagged && data.tag === 42) {
      return new cid.CID(data.value.slice(1))
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
          const res = await find(data, lookup, encode(schema.key, key));
          return decode(schema.value, res)
        },
        asList: async (lookup) => {
          const res = [];
          await forEach(data, lookup, async (k, v) => {
            res.push([decode(schema.key, k), decode(schema.value, v)]);
          });
          return res
        },
        asObject: async (lookup) => {
          const res = {};
          await forEach(data, lookup, async (k, v) => {
            res[decode(schema.key, k)] = decode(schema.value, v);
          });
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
        const res = [];
        for (let i = 0; i < data.length; i++) {
          res.push(decode(schema[i], data[i]));
        }
        return res
      }
      const res = {};
      for (let i = 0; i < data.length; i++) {
        res[schema[i][0]] = decode(schema[i][1], data[i]);
      }
      return res
    }
    if (typeof schema === 'object') {
      const res = {};
      const entries = Object.entries(schema);
      for (let i = 0; i < entries.length; i++) {
        res[entries[i][0]] = decode(entries[i][1], data[i]);
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
      const hashData = cborEncode(encode(schema.input, data));
      const hash = blake.blake2bHex(hashData, null, 32);
      return Buffer.from(hash, 'hex')
    }
    if (schema instanceof Array) {
      if (schema[0] === 'list') {
        return data.map(a => encode(schema[1], a))
      }
      if (schema[0] === 'cbor') {
        return cborEncode(encode(schema[1], data))
      }
      if (schema.length !== data.length) throw new Error('schema and data length do not match')
      const res = [];
      for (let i = 0; i < data.length; i++) {
        res.push(encode(schema[i], data[i]));
      }
      return res
    }
    if (typeof schema === 'object') {
      const res = [];
      const entries = Object.entries(schema);
      for (let i = 0; i < entries.length; i++) {
        let arg;
        if (data instanceof Array) {
          arg = data[i];
        } else {
          arg = data[entries[i][0]];
        }
        res.push(encode(entries[i][1], arg));
      }
      return res
    }
    throw new Error(`Unknown type ${schema}`)
  }

  function actor(address, spec) {
    const res = {};
    for (const [num, method] of Object.entries(spec)) {
      res[method.name] = function (data) {
        let params;
        if (arguments.length > 1) {
          params = encode(method.input, Array.from(arguments));
        } else {
          params = encode(method.input, data);
        }
        // console.log("params", params)
        return {
          to: address,
          value: 0n,
          method: parseInt(num),
          params: cborEncode(params),
        }
      };
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
  };

  const init = {
    2: {
      name: 'exec',
      input: {
        cid: 'cid',
        params: 'buffer',
      },
    },
  };

  const msig_constructor = ['cbor', {
    signers: ['list', 'address'],
    threshold: 'int',
    unlockDuration: 'int',
    startEpoch: 'int',
  }];

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
  };

  const msig_state = {
    signers: ['list', 'address'],
    threshold: 'int',
    next_txn_id: 'int',
    initial_balance: 'bigint',
    start_epoch: 'int',
    unlock_duration: 'int',
    pending: ['ref', pending],
  };

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
  };

  const table = {
    type: 'hamt',
    key: 'address',
    value: 'bigint',
  };

  const verifreg_state = {
    rootkey: 'address',
    verifiers: ['ref', table],
    clients: ['ref', table],
  };

  const reg = {
    t080: multisig,
    t06: verifreg,
    t01: init,
    f080: multisig,
    f06: verifreg,
    f01: init,
  };

  function parse(tx) {
    try {
      const actor = reg[tx.to] || multisig;
      const { name, input } = actor[tx.method];
      const params = decode(input, cbor.decode(tx.params));
      return { name, params, parsed: params && parse(params) }
    } catch (err) {
      return null
    }
  }

  const multisigCID = new cid.CID(1, 'raw', multihashes.encode(Buffer.from('fil/7/multisig'), 'identity'));

  async function buildArrayData(data, load) {
    const dataArray = [];
    await forEach(data, load, function (k, v) {
      dataArray.push([bytesToAddress(k), bytesToBig(v)]);
    });
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
  }
}

const methods = {
  mainnet: make(false),
  testnet: make(true),
};

const cacheAddress = {};
const cacheKey = {};

class VerifyAPI {
  constructor(lotusClient, walletContext, testnet = true) {
    this.methods = testnet ? methods.testnet : methods.mainnet;
    this.client = lotusClient;
    this.walletContext = walletContext;
  }

  static standAloneProvider(lotusEndpoint, token) {
    const provider = new lotusClientProviderNodejs.NodejsProvider(lotusEndpoint, token);
    return new lotusClientRpc.LotusRPC(provider, { schema: lotusClientSchema.mainnet.fullNode })
  }

  static browserProvider(lotusEndpoint, token) {
    const provider = new lotusClientProviderBrowser.BrowserProvider(lotusEndpoint, token);
    return new lotusClientRpc.LotusRPC(provider, { schema: lotusClientSchema.mainnet.fullNode })
  }

  async load(a) {
    const res = await this.client.chainGetNode(a);
    return res.Obj
  }

  async getPath(addr, path) {
    const head = await this.client.chainHead();
    const actor = await this.client.stateGetActor(addr, head.Cids);
    // const state = head.Blocks[0].ParentStateRoot['/']
    // return (await this.client.chainGetNode(`${state}/1/@Ha:${addr}/${path}`)).Obj
    return (await this.client.chainGetNode(`${actor.Head['/']}/${path}`)).Obj
  }

  async listVerifiers() {
    const verifiers = await this.getPath(this.methods.VERIFREG, '1');
    const listOfVerifiers = await this.methods.buildArrayData(verifiers, a => this.load(a));
    const returnList = [];
    for (const [key, value] of listOfVerifiers) {
      returnList.push({
        verifier: key,
        datacap: value.toString(10),
      });
    }
    return returnList
  }

  checkWallet(wallet) {
    if (!wallet && !this.walletContext) { throw new Error('No wallet context defined in API') }
    return wallet || this.walletContext
  }

  async proposeVerifier(verifierAccount, datacap, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01004", for instance
    const tx = this.methods.rootkey.propose(this.methods.verifreg.addVerifier(verifierAccount, datacap));
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas });
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async proposeRemoveVerifier(verifierAccount, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01004", for instance
    const tx = this.methods.rootkey.propose(this.methods.verifreg.removeVerifier(verifierAccount));
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas });
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async send(tx, indexAccount, wallet, { gas } = { gas: 0 }) {
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas });
    return res['/']
  }

  async getReceipt(id) {
    return this.methods.getReceipt(this.client, id)
  }

  async getMessage(cid) {
    return this.methods.getMessage(this.client, cid)
  }

  async stateWaitMessage(cid) {
    return this.methods.stateWaitMsg(this.client, cid)
  }

  async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01003", for instance
    const add = this.methods.verifreg.addVerifier(verifierAccount, datacap);
    const tx = this.methods.rootkey.approve(parseInt(transactionId, 10), { ...add, from: fromAccount });
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas });
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async removeVerifier(verifierAccount, fromAccount, transactionId, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01003", for instance
    const remove = this.methods.verifreg.removeVerifier(verifierAccount);
    const tx = this.methods.rootkey.approve(parseInt(transactionId, 10), { ...remove, from: fromAccount });
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas });
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async cancelVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01003", for instance
    const add = this.methods.verifreg.addVerifier(verifierAccount, datacap);
    const tx = this.methods.rootkey.cancel(parseInt(transactionId, 10), { ...add, from: fromAccount });
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas });
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async listVerifiedClients() {
    const verified = await this.getPath(this.methods.VERIFREG, '2');
    const listOfVerified = await this.methods.buildArrayData(verified, a => this.load(a));
    const returnList = [];
    for (const [key, value] of listOfVerified) {
      returnList.push({
        verified: key,
        datacap: value.toString(10),
      });
    }
    return returnList
  }

  async listRootkeys() {
    return this.listSigners(this.methods.ROOTKEY)
  }

  async listSigners(addr) {
    const data = await this.getPath(addr, '');
    const info = this.methods.decode(this.methods.msig_state, data);
    return info.signers
  }

  async actorType(addr) {
    const head = await this.client.chainHead();
    const actor = await this.client.stateGetActor(addr, head.Cids);
    return actor.Code['/']
  }

  async cachedActorAddress(str) {
    if (cacheAddress[str]) {
      return cacheAddress[str]
    }
    try {
      const head = await this.client.chainHead();
      const ret = await this.client.stateLookupID(str, head.Cids);
      cacheAddress[str] = ret;
      return ret
    } catch (err) {
      return str
    }
  }

  async cachedActorKey(str) {
    if (cacheKey[str]) {
      return cacheKey[str]
    }
    try {
      const head = await this.client.chainHead();
      cacheKey[str] = await this.client.stateAccountKey(str, head.Cids);
      return cacheKey[str]
    } catch (err) {
      return str
    }
  }

  async actorAddress(str) {
    const head = await this.client.chainHead();
    return this.client.stateLookupID(str, head.Cids)
  }

  async actorKey(str) {
    try {
      const head = await this.client.chainHead();
      const res = await this.client.stateAccountKey(str, head.Cids);
      return res
    } catch (err) {
      return str
    }
  }

  async checkClient(verified) {
    try {
      const data = await this.getPath(this.methods.VERIFREG, '');
      const info = this.methods.decode(this.methods.verifreg_state, data);
      const clients = await info.clients(a => this.load(a));
      const datacap = await clients.find(a => this.load(a), verified);
      return [{ verified, datacap }]
    } catch (err) {
      return []
    }
  }

  async checkVerifier(verifier) {
    try {
      const data = await this.getPath(this.methods.VERIFREG, '');
      const info = this.methods.decode(this.methods.verifreg_state, data);
      const verifiers = await info.verifiers(a => this.load(a));
      const datacap = await verifiers.find(a => this.load(a), verifier);
      return [{ verifier, datacap }]
    } catch (err) {
      return []
    }
  }

  async verifyClient(clientAddress, datacap, indexAccount, wallet, { gas } = { gas: 0 }) {
    const arg = this.methods.verifreg.addVerifiedClient(clientAddress, datacap);
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...arg, gas });
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async multisigVerifyClient(multisigAddress, clientAddress, datacap, indexAccount, wallet, { gas } = { gas: 0 }) {
    const tx = this.methods.verifreg.addVerifiedClient(clientAddress, datacap);
    const m_actor = this.methods.actor(multisigAddress, this.methods.multisig);

    const proposeTx = m_actor.propose(tx);
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...proposeTx, gas });

    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async approvePending(msig, tx, from, wallet) {
    const m1_actor = this.methods.actor(msig, this.methods.multisig);
    const messageId = await this.send(m1_actor.approve(parseInt(tx.id), tx.tx), from, wallet);
    return messageId
  }

  async cancelPending(msig, tx, from, wallet) {
    const m1_actor = this.methods.actor(msig, this.methods.multisig);
    return await this.send(m1_actor.cancel(parseInt(tx.id), tx.tx), from, wallet)
  }

  async getTxFromMsgCid(cid) {
    try {
      const waitMsg = await this.stateWaitMessage(cid);
      const txId = waitMsg.ReturnDec.TxnID;

      const getMessage = await this.getMessage(cid);
      const to = getMessage.To;

      const pendingTxs = await this.pendingTransactions(to);
      const tx = pendingTxs.find(tx => { return tx.id === txId });

      if (!tx) return null
      return tx
    } catch (error) {
      console.log(error);
    }
  }

  async multisigProposeClient(m0_addr, m1_addr, client, cap, from, wallet) {
    const amount = cap * 1073741824n; // 1 GiB
    const m0_actor = this.methods.actor(m0_addr, this.methods.multisig);
    const m1_actor = this.methods.actor(m1_addr, this.methods.multisig);
    const tx = this.methods.verifreg.addVerifiedClient(client, amount);
    const tx2 = m0_actor.propose(tx);
    return await this.send(m1_actor.propose(tx2), from, wallet)
  }

  async newMultisig(signers, threshold, cap, from, wallet) {
    const tx = this.methods.init.exec(this.methods.multisigCID, this.methods.encode(this.methods.msig_constructor, [signers, threshold, cap, 1000]));
    const txid = await this.send({ ...tx, value: cap }, from, wallet);
    const receipt = await this.getReceipt(txid);
    const [addr] = this.methods.decode(['list', 'address'], cbor.decode(Buffer.from(receipt.Return, 'base64')));
    return addr
  }

  async multisigAdd(addr, signer, from, wallet) {
    const actor = this.methods.actor(addr, this.methods.multisig);
    const tx = actor.propose(actor.addSigner(signer, false));
    const txid = await this.send(tx, from, wallet);
    return this.getReceipt(txid)
  }

  async pendingRootTransactions() {
    return this.pendingTransactions(this.methods.ROOTKEY)
  }

  async multisigInfo(addr) {
    const data = await this.getPath(addr, '');
    return this.methods.decode(this.methods.msig_state, data)
  }

  async pendingTransactions(addr) {
    const data = await this.getPath(addr, '6');
    const info = this.methods.decode(this.methods.pending, data);
    const obj = await info.asObject(a => this.load(a));
    const returnList = [];
    for (const [k, v] of Object.entries(obj)) {
      const parsed = this.methods.parse(v);
      returnList.push({
        id: parseInt(k),
        tx: { ...v, from: v.signers[0] },
        parsed,
        signers: v.signers,
      });
    }
    return returnList
  }

  async signAndPushCustomTransaction(from, to, params) {
    try {
      const nonce = await this.client.mpoolGetNonce(from);

      const msg = {
        // version: 42,
        to,
        from,
        nonce,
        value: '0',
        gaslimit: 208863,
        gasfeecap: '100000000',
        gaspremium: '0',
        method: 1,
        params,
      };
      const walletSignMessage = await this.client.walletSignMessage(from, msg);
      const pushedMsgId = await this.client.mpoolPush(walletSignMessage);
      return { success: true, walletSignMessage, pushedMsgId }
    } catch (error) {
      return { success: false, error }
    }
  }

  async listMessagesFromToAddress(From, To, heightPerc = 0.5) {
    try {
      const head = await this.client.chainHead();
      const messages = await this.client.stateListMessages(
        {
          To,
          From,
        },
        head.Cids,
        Math.round(head.Height - head.Height * heightPerc),
      );
      return messages ? { success: true, messages } : { success: false }
    } catch (error) {
      return { success: false, error }
    }
  }

  async mpoolPush(walletSignMessage) {
    try {
      const pushedMsgId = await this.client.mpoolPush(walletSignMessage);
      return pushedMsgId
    } catch (error) {
      return false
    }
  }
}

/* eslint-disable indent */
/* eslint-disable no-useless-escape */
function parseApprovedRequestWithSignerAddress(issueContent) {
    const data = {
        method: 'Request',
        address: 'Address',
        datacap: 'Datacap Allocated',
        signerAddress: 'Signer Address',
        message: 'Message sent to Filecoin Network',
        uuid: 'Id',
    };
    const parsedData = {
        correct: true,
        errorMessage: '',
        errorDetails: '',
    };

    const trimmed = issueContent.replace(/(\n)|(\r)/gm, '');

    for (const [key, value] of Object.entries(data)) {
        let rg = new RegExp(`(?<=${value}>)(.*?)(?=#)`);

        if (key === 'address') {
            // here some space problem which is always giving the => signer address thats why i create another rg with space
            rg = new RegExp(`(?<=${value} >)(.*?)(?=#)`);
        }

        if (key === 'method') {
            parsedData.approvedMessage = trimmed.includes(value);
            continue
        }

        const result = trimmed?.match(rg)[0].trim() || null;
        const resultIsNull = !result || !result.length;

        if (resultIsNull) {
            parsedData.correct = false;
            parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`;
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
            continue
        }
        parsedData[key] = result || null;
    }

    return parsedData
}

/* eslint-disable indent */
/**
 * @param commentBody
 * @returns parsedData, the data parsed out of the comment
 * @trimmed we need to trim the body, removing newlines and other characters, to ease the parsing
 * @data is the data field we want to get
 * @rg is the regex we dynamically create in the for loop
 * @result is the result of the regex
 * @link to regex --> https://regex101.com/r/31sf7d/1
 */
function ldnv3TriggerCommentParser(commentBody) {
    const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '');
    const data = {
        isTriggerComment: 'Datacap Request Trigger',
        totalDatacap: 'Total DataCap requested',
        weeklyDatacap: 'Expected weekly DataCap usage rate',
        clientAddress: 'Client address',
    };

    const parsedData = {
        correct: true,
        errorMessage: '',
    };

    for (const [k, v] of Object.entries(data)) {
        if (k === 'isTriggerComment') {
            parsedData.isTriggerComment = trimmed.includes(v);
            continue
        }
        const rg = new RegExp(`(?<=${v})(.*?)?(?=#)(?=#)|(?<=${v}).*$`);
        const result = trimmed?.match(rg)[0].trim() || null;
        const resultIsNull = !result || !result.length;

        if (resultIsNull) {
            parsedData.correct = false;
            parsedData.errorMessage += `We could not find **${v}** field in the information provided\n`;
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
            continue
        }
        parsedData[k] = result || null;
    }
    return parsedData
}

/* eslint-disable indent */
function parseNewLdn(trimmed) {
    const regexForAdress = /^(f1|f3)/;

    const data = {
        name: 'Data Owner Name',
        region: 'Data Owner Country\/Region', //eslint-disable-line
        website: 'Website',
        datacapRequested: 'Total amount of DataCap being requested',
        dataCapWeeklyAllocation: 'Weekly allocation of DataCap requested',
        address: 'On-chain address for first allocation',
        isCustomNotary: 'Custom multisig',
        identifier: 'Identifier',
    };

    const parsedData = {
        correct: true,
        errorMessage: '',
        errorDetails: '',
    };

    for (const [k, v] of Object.entries(data)) {
        const rg = new RegExp(`(?<=${v})(.*?)(?=#)`);
        const regexIsNull = !trimmed.match(rg) || !trimmed.match(rg).length || !trimmed.match(rg)[0];

        if ((k === 'identifier' || k === 'Custom multisig') && regexIsNull) continue

        if (regexIsNull) {
            parsedData.correct = false;
            parsedData.errorMessage += `We could not find **${v}** field in the information provided\n`;
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
            continue
        }

        parsedData[k] = trimmed.match(rg) ? trimmed.match(rg)[0] : null;

        const isCustomRg = /- \[x\] Use Custom Multisig/gi;

        if (k === 'isCustomNotary') parsedData[k] = isCustomRg.test(parsedData[k]);

        if (parsedData[k] === '_No response_') parsedData[k] = null;

        if (k === 'address') {
            parsedData['isAddressFormatted'] = regexForAdress.test(parsedData[k]); //eslint-disable-line
        }
    }
    return parsedData
}

/* eslint-disable no-useless-escape */
/**
 *
 * @param {*} issueContent
 * @returns
 * @link to regex https://regex101.com/r/dJ69Sk/1
 */
function parseOldLDN(issueContent) {
  const data = {
    name: 'Organization Name',
    region: 'Region',
    website: 'Website \\/ Social Media',
    datacapRequested: 'Total amount of DataCap being requested \\(between 500 TiB and 5 PiB\\)',
    dataCapWeeklyAllocation: 'Weekly allocation of DataCap requested \\(usually between 1-100TiB\\)',
    address: 'On-chain address for first allocation',
    isCustomNotary: 'Type',
    identifier: /Identifier: (.*)/,
  };

  const regexForAdress = /^(f1|f3)/;

  const parsedData = {
    correct: true,
    errorMessage: '',
    errorDetails: '',
  };

  const trimmed = issueContent.replace(/(\n)|(\r)/gm, '');

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value}:)(.*?)(?=-)`);

    let result;
    if (key === 'identifier') {
      result = issueContent.match(value)[1].trim();
    } else {
      result = trimmed?.match(rg)[0].trim() || null;
    }

    const resultIsNull = !result || !result.length;

    if (resultIsNull) {
      if (key === 'identifier' || key === 'isCustomNotary') continue
      parsedData.correct = false;
      parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`;
      if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
      continue
    }

    if (key === 'isCustomNotary') {
      parsedData[key] = result === 'Custom Notary';
      continue
    }

    parsedData[key] = result || null;

    if (key === 'address') {
      parsedData["isAddressFormatted"] = regexForAdress.test(parsedData[key]); //eslint-disable-line
    }
  }

  return parsedData
}

/* eslint-disable indent */

// ldn template parser
function parseIssue$1(issueContent) {
    const trimmed = issueContent.replace(/(\n)|(\r)/gm, '');

    if (trimmed.startsWith('### Data Owner Name')) { return parseNewLdn(trimmed) }

    return parseOldLDN(issueContent)
}

/* eslint-disable indent */
function parseMultisigNotaryRequest(commentBody) {
    const data = {
        regexMultisig: 'Multisig Notary requested',
        totalDatacaps: 'Total DataCap requested',
        weeklyDatacap: 'Expected weekly DataCap usage rate',
};

const parsedData = {
    correct: true,
    multisigMessage: true,
    errorMessage: '',
};

const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '');

for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value})(.*?)?(?=#)(?=#)|(?<=${value}).*$`);

    if (key === 'regexMultisig') {
        parsedData.multisigMessage = trimmed.includes(value);
        continue
    }

    const result = trimmed?.match(rg)[0].trim() || null;
    const resultIsNull = !result || !result.length;

    if (resultIsNull) {
        parsedData.correct = false;
        parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`;
        if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
        continue
    }
    parsedData[key] = result || null;
}

return parsedData
}

/* eslint-disable indent */
function parseMultisigReconnectComment(commentBody) {
const data = {
    regexRequest: 'Multisig Notary Reconnection Request',
    msigAddress: 'Multisig Notary Address',
    clientAddress: 'Client Address',
    issueURI: 'Notary Governance Issue',
};

const parsedData = {
    correct: true,
    multisigMessage: true,
    errorMessage: '',
};
const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '');

for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value})(.*?)?(?=#)(?=#)|(?<=${value}).*$`);

    if (key === 'regexRequest') {
        parsedData.multisigMessage = trimmed.includes(value);
        continue
    }

    const result = trimmed?.match(rg)[0].trim() || null;
    const resultIsNull = !result || !result.length;

    if (resultIsNull) {
        parsedData.correct = false;
        parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`;
        if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
        continue
    }
    parsedData[key] = result || null;
}

return parsedData
}

function parseNotaryConfirmation(commentContent, title) {
  const result = title.match(/#(\d+)/);

  const confirmationText = '## The request has been signed by a new Root Key Holder';

  const confirmationMessage = commentContent.includes(confirmationText);

  if (!result) {
    return {
      errorMessage: 'no title found',
      confirmationMessage,
    }
  }

  return {
    confirmationMessage,
    number: Number(result[1]),
  }
}

/* eslint-disable indent */
function parseWeeklyDataCapAllocationUpdateRequest(commentBody) {
    const data = {
        regexRequest: 'Weekly DataCap Allocation Update requested',
        allocationDatacap: 'Update to expected weekly DataCap usage rate',
    };

    const parsedData = {
        correct: true,
        multisigMessage: true,
        errorMessage: '',
    };

const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '');

for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value})(.*?)?(?=#)(?=#)|(?<=${value}).*$`);

    if (key === 'regexRequest') {
        parsedData.multisigMessage = trimmed.includes(value);
        continue
    }

    const result = trimmed?.match(rg)[0].trim() || null;
    const resultIsNull = !result || !result.length;

    if (resultIsNull) {
        parsedData.correct = false;
        parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`;
        if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
        continue
    }
    parsedData[key] = result || null;
}

return parsedData
}

/* eslint-disable indent */
function parseReleaseRequest(commentBody) {
    const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '');
    const data = {
        regexMultisig: 'DataCap Allocation requested',
        notaryAddress: 'Multisig Notary address',
        clientAddress: 'Client address',
        allocationDatacap: 'DataCap allocation requested',
        uuid: 'Id',
    };

    const parsedData = {
        correct: true,
        multisigMessage: true,
        errorMessage: '',
    };

    for (const [k, v] of Object.entries(data)) {
        if (k === 'regexMultisig') {
            parsedData.multisigMessage = trimmed.includes(v);
            continue
        }
        const rg = new RegExp(`(?<=${v})(.*?)?(?=#)(?=#)|(?<=${v}).*$`);
        const result = trimmed?.match(rg)[0].trim() || null;
        const resultIsNull = !result || !result.length;

        if (resultIsNull) {
            parsedData.correct = false;
            parsedData.errorMessage += `We could not find **${v}** field in the information provided\n`;
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
            continue
        }

        if (k === 'allocationDatacap') {
            parsedData.allocationDataCapAmount = [result];
        }

        parsedData[k] = result || null;
    }
    return parsedData
}

var largeIssueParser = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ldnv3TriggerCommentParser: ldnv3TriggerCommentParser,
  parseApprovedRequestWithSignerAddress: parseApprovedRequestWithSignerAddress,
  parseIssue: parseIssue$1,
  parseMultisigNotaryRequest: parseMultisigNotaryRequest,
  parseMultisigReconnectComment: parseMultisigReconnectComment,
  parseNotaryConfirmation: parseNotaryConfirmation,
  parseReleaseRequest: parseReleaseRequest,
  parseWeeklyDataCapAllocationUpdateRequest: parseWeeklyDataCapAllocationUpdateRequest
});

// used in large-issue-parser and notary-issue-parser
function matchGroupLargeNotary(regex, content) {
  let m;
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 2) {
      return m[1].trim()
    }
    return m[0].trim()
  }
}

function parseNotaryAddress(issueContent) {
  const regexObj = {
    regexAddressZero: /-?\s*On-chain\s*Address\(es\)\s*to\s*be\s*Notarized:\s*(.*)/mi,
    regexAddressOne: /-?\s*On-chain\s*Address\s*to\s*be\s*Notarized:\s*(.*)/mi,
    regexAddressTwo: /-?\s*On-chain\s*address\s*to\s*be\s*notarized\s*\(recommend using a new address\):\s*(.*)/mi,
  };

  for (const key of Object.keys(regexObj)) {
    const address = matchGroupLargeNotary(regexObj[key], issueContent);

    if (address) {
      return address
    }
  }
  return false
}

function parseNotaryLedgerVerifiedComment(commentContent) {
  const regexVerified = /##\s*Notary\s*Ledger\s*Verified/m;

  const verified = matchGroupLargeNotary(regexVerified, commentContent);

  if (verified) {
    return {
      correct: true,
    }
  }

  let errorMessage = '';
  if (!verified) { errorMessage += 'The issue is not verified\n'; }

  return {
    correct: false,
    errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseApproveComment(commentBody) {
  const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '');

  const data = {
    approved: 'Request Approved',
    address: 'Address',
    datacap: 'Datacap Allocated',
  };

  const parsedData = {
    correct: true,
    errorMessage: '',
    approvedMessage: true,
  };

  for (const [k, v] of Object.entries(data)) {
    if (k === 'approved') {
      parsedData.isTriggerComment = trimmed.includes(v);
      continue
    }
    const rg = new RegExp(`(?<=${v})(.*?)?(?=#)(?=#)|(?<=${v}).*$`);
    const result = trimmed?.match(rg)[0].trim() || null;
    const resultIsNull = !result || !result.length;

    if (resultIsNull) {
      parsedData.correct = false;
      parsedData.errorMessage += `We could not find **${v}** field in the information provided\n`;
      if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.';
      continue
    }
    parsedData[k] = result || null;
  }
  return parsedData
}

/* eslint-disable no-useless-escape */
function parseIssue(issueContent) {
  const data = {
    name: 'Name',
    organization: 'Affiliated organization',
    address: 'On-chain address to be notarized \\(recommend using a new address\\)',
    country: 'Country of Operation',
    region: 'Country of Operation',
    useCases: 'Use case\\(s\\) to be supported',
    datacapRequested: 'DataCap requested for allocation \\(10TiB - 1PiB\\)',
    behalf: /-\s*Are you applying on behalf of yourself or an organization\?:\s*(.*)/m,
  };

  const parsedData = {
    correct: true,
    errorMessage: '',
    errorDetails: '',
  };

  const trimmed = issueContent.replace(/(\n)|(\r)/gm, '');

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value}:)(.*?)(?=-)`);

    let result;
    if (key === 'behalf') {
      result = issueContent.match(value)[1].trim();
    } else {
      result = trimmed?.match(rg)[0].trim() ?? null;
    }

    const resultIsNull = !result || !result.length;

    if (resultIsNull) {
      parsedData.correct = false;
      parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`;
    }

    parsedData[key] = result || null;
  }

  return parsedData
}

var notaryIssueParser = /*#__PURE__*/Object.freeze({
  __proto__: null,
  parseApproveComment: parseApproveComment,
  parseIssue: parseIssue,
  parseNotaryAddress: parseNotaryAddress,
  parseNotaryLedgerVerifiedComment: parseNotaryLedgerVerifiedComment
});

exports.VerifyAPI = VerifyAPI;
exports.ldnParser = largeIssueParser;
exports.methods = methods;
exports.notaryParser = notaryIssueParser;
