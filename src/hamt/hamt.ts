//@ts-nocheck
import { encode, Address } from '@glif/filecoin-address'
import sha256 from 'js-sha256'

// Get n next bits
function nextBits(obj, n) {
  // if (obj.left < n) throw new Error("out of bits")
  const res = (obj.num >> BigInt(obj.left - n)) & BigInt((1 << n) - 1)
  obj.left -= n
  return res
}

function indexForBitPos(bp, bitfield) {
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

const _nextBits = nextBits
export { _nextBits as nextBits }
const _indexForBitPos = indexForBitPos
export { _indexForBitPos as indexForBitPos }

function getBit(b, n) {
  return Number((b >> n) & 0x1n)
}

async function getValue(n, load, hv, key) {
  const idx = nextBits(hv, n.bitWidth)
  if (getBit(n.data.bitfield, idx) === 0) {
    throw new Error('not found in bitfield')
  }

  const cindex = indexForBitPos(idx, n.data.bitfield)

  const c = n.data.pointers[cindex]

  if (c instanceof Array) {
    for (const [k, v] of c) {
      if (makeBuffers(k).toString() === makeBuffers(key).toString()) return makeBuffers(v)
    }
  } else {
    const child = await load(c['/'])
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

const _makeBuffers = makeBuffers
export { _makeBuffers as makeBuffers }

async function forEach(n, load, cb) {
  for (const c of n.data.pointers) {
    if (c instanceof Array) {
      for (const [k, v] of c) {
        await cb(makeBuffers(k), makeBuffers(v))
      }
    } else {
      const child = await load(c['/'])
      await forEach({ bitWidth: n.bitWidth, data: parseNode(child) }, load, cb)
    }
  }
}

function bytesToBig(p) {
  let acc = 0n
  for (let i = 0; i < p.length; i++) {
    acc *= 256n
    acc += BigInt(p[i])
  }
  return acc
}

const _bytesToBig = bytesToBig
export { _bytesToBig as bytesToBig }

function parseNode(data) {
  return {
    pointers: data[1],
    bitfield: bytesToBig(Buffer.from(data[0]['/'] ? data[0]['/'].bytes : data[0], 'base64')),
  }
}

const _parseNode = parseNode
export { _parseNode as parseNode }

export async function find(data, load, key) {
  const hash = bytesToBig(Buffer.from(sha256(key), 'hex'))
  return getValue({ bitWidth: 5, data: parseNode(data) }, load, { num: hash, left: 256 }, key)
}

const _forEach = async function (data, load, cb) {
  await forEach({ bitWidth: 5, data: parseNode(data) }, load, cb)
}
export { _forEach as forEach }

export async function buildArrayData(data, load) {
  const dataArray = []
  await forEach({ bitWidth: 5, data: parseNode(data) }, load,
    (k, v) => {
      dataArray.push([encode('t', new Address(k)), bytesToBig(makeBuffers(v))])
    })

  return dataArray
}

function readVarInt(bytes, offset) {
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

const _readVarInt = function (bytes, offset) {
  return readVarInt(bytes, offset || 0)
}
export { _readVarInt as readVarInt }
