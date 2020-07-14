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
	if (obj.left < n) throw new Error("out of bits")
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
	/*
	if c.isShard() {
		chnd, err := c.loadChild(ctx, n.store, n.bitWidth, n.hash)
		if err != nil {
			return err
		}

		return chnd.getValue(ctx, hv, k, cb)
	}

	for _, kv := range c.KVs {
		if string(kv.Key) == k {
			return cb(kv)
		}
	}

    return ErrNotFound
    */
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
		bitfield: bytesToBig(Buffer.from("REAA", "base64")),
	}
}

function find(n, key) {
	console.log(hash(key).h1)
    return getValue(n, {num: hash(key).h1, left: 64}, key)
}

find({bitWidth: 5, data: parseNode(data)}, Buffer.from("ARiJj38k7tKKrHfwsOztHUhl+Z/j", "base64"))
find({bitWidth: 5, data: parseNode(data)}, Buffer.from("AOkH", "base64"))
find({bitWidth: 5, data: parseNode(data)}, Buffer.from("AFA=", "base64"))


