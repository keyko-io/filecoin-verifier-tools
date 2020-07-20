const address = require('@openworklabs/filecoin-address')
const hash = require('./hash').hash

// Get n next bits
function nextBits(obj, n) {
	// if (obj.left < n) throw new Error("out of bits")
    let res = (obj.num >> BigInt(obj.left-n)) & BigInt((1 << n) - 1)
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

// console.log("pos", indexForBitPos(10, 0xf0f0f00f0ff0f0n))

/*
console.log(readVarInt(Buffer.from("AOkH", "base64"), 1))
console.log(readVarInt(Buffer.from("AFA=", "base64"), 1))

console.log(Buffer.from("AATS", "base64"))

console.log(Buffer.from("REAA", "base64"))
*/
let data = [
	"REAA",
	[
		{
			"1": [
				[
					"ARiJj38k7tKKrHfwsOztHUhl+Z/j",
					"AATS"
				]
			]
		},
		{
			"1": [
				[
					"AOkH",
					""
				]
			]
		},
		{
			"1": [
				[
					"AFA=",
					""
				]
			]
		}
	]
]

function getBit(b, n) {
    return Number((b >> n) & 0x1n)
}

async function getValue(n, load, hv, key) {
    let idx = nextBits(hv, n.bitWidth)
	console.log("idx", idx)
	
	console.log(n.data.bitfield.toString(2))

	if (getBit(n.data.bitfield, idx) == 0) {
		throw new Error("not found in bitfield")
	}

	let cindex = indexForBitPos(idx, n.data.bitfield)

	let c = n.data.pointers[cindex]

	console.log("cindex", cindex, c)

	if (c[0]) {
		let child = await load(c[0]['/'])
		return getValue({bitWidth: n.bitWidth, data: parseNode(child)}, hv, key)
	}
	if (c[1]) {
		for (let [k,v] of c[1]) {
			// console.log(`key ${addressToString(k)} value ${bytesToBig(Buffer.from(v, "base64"), 0)}`)
			return Buffer.from(v, "base64")
		}
	}
	throw new Error("key not found")
}

async function forEach(n, load, cb) {
	for (let c of n.data.pointers) {
		if (c[0]) {
			let child = await load(c[0]['/'])
			await forEach({bitWidth: n.bitWidth, data: parseNode(child)}, cb)
		}
		if (c[1]) {
			for (let [k, v] of c[1]) {
				// let addr = new address.Address(Buffer.from(k, "base64"))
				await cb(Buffer.from(k, "base64"), Buffer.from(v, "base64"))
				// console.log(`key ${address.encode("t",addr)} value ${bytesToBig(Buffer.from(v, "base64"), 0)}`)
			}
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

function parseNode(data) {
	return {
		pointers: data[1],
		bitfield: bytesToBig(Buffer.from(data[0], "base64")),
	}
}

function load() {
	throw new Error("not implemented")
}

function find(n, key) {
	// console.log(hash(key).h1)
    return getValue(n, load, {num: hash(key).h1, left: 64}, key)
}

function print(k,v) {
	console.log(address.encode('t', new address.Address(k)), bytesToBig(v))
}

async function main() {
	find({bitWidth: 5, data: parseNode(data)}, Buffer.from("ARiJj38k7tKKrHfwsOztHUhl+Z/j", "base64"))
	find({bitWidth: 5, data: parseNode(data)}, Buffer.from("AOkH", "base64"))
	find({bitWidth: 5, data: parseNode(data)}, Buffer.from("AFA=", "base64"))

	forEach({bitWidth: 5, data: parseNode(data)}, load, print)
}

main()

exports.printData = async function (data, load) {
	await forEach({bitWidth: 5, data: parseNode(data)}, async a => {
		return load(a)
	},
	print)
}

