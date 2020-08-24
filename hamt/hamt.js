const address = require('@openworklabs/filecoin-address')
// const hash = require('./hash').hash
const sha256 = require('js-sha256')

// Get n next bits
function nextBits (obj, n) {
  // if (obj.left < n) throw new Error("out of bits")
  const res = (obj.num >> BigInt(obj.left - n)) & BigInt((1 << n) - 1)
  obj.left -= n
  return res
}

/*
let obj = {left:64, num: 0x12345fffan}

console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))

console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))
console.log(nextBits(obj, 5))
*/

function indexForBitPos (bp, bitfield) {
  let acc = bitfield
  let idx = 0
  while (bp > 0) {
    if ((acc & 1n) === 1n) {
      idx++
    }
    bp--
    acc = acc >> 1n
  }
  return idx
}

// console.log("pos", indexForBitPos(10, 0xf0f0f00f0ff0f0n))

/*
console.log(readVarInt(Buffer.from("AOkH", "base64"), 1))
console.log(readVarInt(Buffer.from("AFA=", "base64"), 1))

console.log(Buffer.from("AATS", "base64"))

console.log(Buffer.from("REAA", "base64"))
const data = [
  'REAA',
  [
    {
      1: [
        [
          'ARiJj38k7tKKrHfwsOztHUhl+Z/j',
          'AATS',
        ],
      ],
    },
    {
      1: [
        [
          'AOkH',
          '',
        ],
      ],
    },
    {
      1: [
        [
          'AFA=',
          '',
        ],
      ],
    },
  ],
]
*/

function getBit (b, n) {
  return Number((b >> n) & 0x1n)
}

async function getValue (n, load, hv, key) {
  const idx = nextBits(hv, n.bitWidth)
  if (getBit(n.data.bitfield, idx) === 0) {
    throw new Error('not found in bitfield')
  }

  const cindex = indexForBitPos(idx, n.data.bitfield)

  const c = n.data.pointers[cindex]

  if (c[0]) {
    const child = await load(c[0]['/'])
    return getValue({ bitWidth: n.bitWidth, data: parseNode(child) }, load, hv, key)
  }
  if (c[1]) {
    for (const [k, v] of c[1]) {
      // console.log(`key ${addressToString(k)} value ${bytesToBig(Buffer.from(v, "base64"), 0)}`)
      if (k === key.toString('base64')) return Buffer.from(v, 'base64')
    }
  }
  throw new Error('key not found')
}

function makeBuffers (obj) {
  if (typeof obj === 'string') {
    return Buffer.from(obj, 'base64')
  }
  if (typeof obj === 'number') {
    return obj
  }
  if (obj instanceof Array) {
    return obj.map(makeBuffers)
  }
}

exports.makeBuffers = makeBuffers

async function forEach (n, load, cb) {
  for (const c of n.data.pointers) {
    if (c[0]) {
      const child = await load(c[0]['/'])
      await forEach({ bitWidth: n.bitWidth, data: parseNode(child) }, load, cb)
    }
    if (c[1]) {
      for (const [k, v] of c[1]) {
        await cb(Buffer.from(k, 'base64'), makeBuffers(v))
      }
    }
  }
}

function bytesToBig (p) {
  let acc = 0n
  for (let i = 0; i < p.length; i++) {
    acc *= 256n
    acc += BigInt(p[i])
  }
  return acc
}

exports.bytesToBig = bytesToBig

function parseNode (data) {
  return {
    pointers: data[1],
    bitfield: bytesToBig(Buffer.from(data[0], 'base64')),
  }
}

function print (k, v) {
  console.log(address.encode('t', new address.Address(k)), bytesToBig(v))
}

/*
function load () {
  throw new Error('not implemented')
}

async function main () {
  find({ bitWidth: 5, data: parseNode(data) }, Buffer.from('ARiJj38k7tKKrHfwsOztHUhl+Z/j', 'base64'))
  find({ bitWidth: 5, data: parseNode(data) }, Buffer.from('AOkH', 'base64'))
  find({ bitWidth: 5, data: parseNode(data) }, Buffer.from('AFA=', 'base64'))

  forEach({ bitWidth: 5, data: parseNode(data) }, load, print)
}
*/
// main()

exports.find = async function (data, load, key) {
  const hash = bytesToBig(Buffer.from(sha256(key), 'hex'))
  return getValue({ bitWidth: 5, data: parseNode(data) }, load, { num: hash, left: 256 }, key)
}

exports.forEach = async function (data, load, cb) {
  await forEach({ bitWidth: 5, data: parseNode(data) }, async a => {
    return load(a)
  },
  cb)
}

exports.printData = async function (data, load) {
  await forEach({ bitWidth: 5, data: parseNode(data) }, async a => {
    return load(a)
  },
  print)
}

exports.buildArrayData = async function (data, load) {
  var dataArray = []
  await addToArray({ bitWidth: 5, data: parseNode(data) }, async a => {
    return load(a)
  },
  dataArray)

  return dataArray
}

async function addToArray (n, load, dataArray) {
  for (const c of n.data.pointers) {
    if (c[0]) {
      const child = await load(c[0]['/'])
      await addToArray({ bitWidth: n.bitWidth, data: parseNode(child) }, load, dataArray)
    }
    if (c[1]) {
      for (const [k, v] of c[1]) {
        await dataArray.push([address.encode('t', new address.Address(Buffer.from(k, 'base64'))), bytesToBig(makeBuffers(v))])
      }
    }
  }
}

function readVarInt (bytes, offset) {
  let res = 0n
  let acc = 1n
  for (let i = offset; i < bytes.length; i++) {
    res += BigInt(bytes[i] & 0x7f) * acc
    if (bytes[i] < 0x7f) {
      return res
    }
    acc *= 128n
  }
  return res
}

exports.readVarInt = function (bytes) {
  return readVarInt(bytes, 0)
}
