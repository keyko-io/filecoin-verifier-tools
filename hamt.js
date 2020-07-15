const hash = require('./hash').hash

// Get n next bits
/*
function nextBits(obj, n) {
    if (obj.left < n) throw new Error("out of bits")
    let res = obj.num & BigInt((2 << n) - 1)
    obj.left -= n
    obj.num = obj.num >> BigInt(n)
    return res
}*/

function nextBits(obj, n) {
	// if (obj.left < n) throw new Error("out of bits")
    let res = (obj.num >> BigInt(obj.left-n)) & BigInt((1 << n) - 1)
    obj.left -= n
    return res
}

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

function indexForBitPos(bp, bitfield) {
    let acc = bitfield
    console.log(acc)
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

console.log("pos", indexForBitPos(10, 0xf0f0f00f0ff0f0n))

function readVarInt(bytes, offset) {
    let res = 0n
    let acc = 1n
    for (let i = offset; i < bytes.length; i++) {
        res += BigInt(bytes[i]&0x7f)*acc
        if (bytes[i] < 0x7f) {
            return res
        }
        acc *= 128n
    }
    return res
}

console.log(readVarInt(Buffer.from("AOkH", "base64"), 1))
console.log(readVarInt(Buffer.from("AFA=", "base64"), 1))

console.log(Buffer.from("AATS", "base64"))

console.log(Buffer.from("REAA", "base64"))

const blake = require('blakejs')

function base32(bytes, alphabet) {
	let bn = {num: bytesToBig(bytes), left: bytes.length*8}
	let res = ""
	while (bn.left > 0) {
		res += alphabet[Number(nextBits(bn, 5))]
	}
	return res
}

function addressToString(dta) {
	let bytes = Buffer.from(dta, "base64")
	let addr = "wait"
	if (bytes[0] == 0) {
		addr = readVarInt(bytes, 1)
	}
	if (bytes[0] == 1) {
		let hash = blake.blake2bHex(bytes, null, 4)
		let b = Buffer.concat([bytes.slice(1), Buffer.from(hash,"hex")])
		addr = base32(b, "abcdefghijklmnopqrstuvwxyz234567")
	}
	return `t${bytes[0]}${addr}`
}

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

function getValue(n, hv, key) {
    let idx = nextBits(hv, n.bitWidth)
	console.log("idx", idx)
	
	console.log(n.data.bitfield.toString(2))

	if (getBit(n.data.bitfield, idx) == 0) {
		throw new Error("not found in bitfield")
	}

	let cindex = indexForBitPos(idx, n.data.bitfield)

	let c = n.data.pointers[cindex]

	console.log("cindex", cindex, c)

	for (let it of Object.values(c)) {
		for (let [k,v] of it) {
			console.log(`key ${addressToString(k)} value ${bytesToBig(Buffer.from(v, "base64"), 0)}`)
		}
	}
	/*
	if c.isShard() {
		chnd, err := c.loadChild(ctx, n.store, n.bitWidth, n.hash)
		if err != nil {
			return err
		}

		return chnd.getValue(ctx, hv, k, cb)
	}

    return ErrNotFound
    */
}

async function forEach(n, load) {
	for (let c of n.data.pointers) {
		if (c[0]) {
			let child = await load(c[0]['/'])
			await forEach({bitWidth: n.bitWidth, data: parseNode(child)})
		}
		if (c[1]) {
			for (let [k, v] of c[1]) {
				console.log(`key ${addressToString(k)} value ${bytesToBig(Buffer.from(v, "base64"), 0)}`)
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

function find(n, key) {
	console.log(hash(key).h1)
    return getValue(n, {num: hash(key).h1, left: 64}, key)
}

find({bitWidth: 5, data: parseNode(data)}, Buffer.from("ARiJj38k7tKKrHfwsOztHUhl+Z/j", "base64"))
find({bitWidth: 5, data: parseNode(data)}, Buffer.from("AOkH", "base64"))
find({bitWidth: 5, data: parseNode(data)}, Buffer.from("AFA=", "base64"))

forEach({bitWidth: 5, data: parseNode(data)})

exports.printData = async function (data, load) {
	await forEach({bitWidth: 5, data: parseNode(data)}, async a => {
		return load(a)
	})
}

