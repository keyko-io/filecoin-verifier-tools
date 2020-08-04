
const mask64 = 0xffffffffffffffffn

const c1_128 = 0x87c37b91114253d5n
const c2_128 = 0x4cf5ad432745937fn

function fmix64(k) {
	k ^= k >> 33n
    k *= 0xff51afd7ed558ccdn
    k &= mask64
	k ^= k >> 33n
	k *= 0xc4ceb9fe1a85ec53n
    k &= mask64
	k ^= k >> 33n
	return k
}

function getu64(p, offset) {
    let acc = 0n
    for (let i = 0; i < 8; i++) {
        acc *= 256n
        acc += BigInt(p[offset-i+7])
    }
    return acc
}

function rotateLeft64(k, n) {
    return ((k << n) | (k >> (64n-n))) & mask64
}

function bmix(hasher, p) {
    let {h1, h2} = hasher
    let nblocks = Math.floor(p.length/16)
    for (let i = 0; i < nblocks; i++) {
        let k1 = getu64(p, 0+i*16)
        let k2 = getu64(p, 8+i*16)
        k1 *= c1_128
        k1 &= mask64
		k1 = rotateLeft64(k1, 31n)
		k1 *= c2_128
        k1 &= mask64
		h1 ^= k1

		h1 = rotateLeft64(h1, 27n)
		h1 += h2
        h1 &= mask64
		h1 = h1*5n + 0x52dce729n
        h1 &= mask64

		k2 *= c2_128
        k2 &= mask64
		k2 = rotateLeft64(k2, 33n)
		k2 *= c1_128
        k2 &= mask64
		h2 ^= k2

		h2 = rotateLeft64(h2, 31n)
		h2 += h1
        h2 &= mask64
		h2 = h2*5n + 0x38495ab5n
        h2 &= mask64
    }
    return {h1, h2}
}

function sum128({h1, h2}, p) {
    let k1 = 0n
    let k2 = 0n
    let nblocks = Math.floor(p.length/16)
    let offset = nblocks*16
    let tail_len = p.length % 16
	switch (tail_len) {
	case 15:
		k2 ^= BigInt(p[offset+14]) << 48n
	case 14:
		k2 ^= BigInt(p[offset+13]) << 40n
	case 13:
		k2 ^= BigInt(p[offset+12]) << 32n
	case 12:
		k2 ^= BigInt(p[offset+11]) << 24n
	case 11:
		k2 ^= BigInt(p[offset+10]) << 16n
	case 10:
		k2 ^= BigInt(p[offset+9]) << 8n
	case 9:
		k2 ^= BigInt(p[offset+8]) << 0n

        k2 *= c2_128
        k2 &= mask64
		k2 = rotateLeft64(k2, 33n)
		k2 *= c1_128
        k2 &= mask64
		h2 ^= k2

	case 8:
		k1 ^= BigInt(p[offset+7]) << 56n
	case 7:
		k1 ^= BigInt(p[offset+6]) << 48n
	case 6:
		k1 ^= BigInt(p[offset+5]) << 40n
	case 5:
		k1 ^= BigInt(p[offset+4]) << 32n
	case 4:
		k1 ^= BigInt(p[offset+3]) << 24n
	case 3:
		k1 ^= BigInt(p[offset+2]) << 16n
	case 2:
		k1 ^= BigInt(p[offset+1]) << 8n
	case 1:
		k1 ^= BigInt(p[offset+0]) << 0n
		k1 *= c1_128
        k1 &= mask64
		k1 = rotateLeft64(k1, 31n)
		k1 *= c2_128
        k1 &= mask64
		h1 ^= k1
	}

	h1 ^= BigInt(p.length)
	h2 ^= BigInt(p.length)

	h1 += h2
    h1 &= mask64
	h2 += h1
    h2 &= mask64

	h1 = fmix64(h1)
	h2 = fmix64(h2)

	h1 += h2
    h1 &= mask64
	h2 += h1
    h2 &= mask64

	return {h1, h2}

}

function hash(p) {
    let hash1 = bmix({h1: 0n, h2: 0n}, p)
    return sum128(hash1, p)
}

exports.fmix = fmix64
exports.bmix = bmix
exports.hash = hash

/*
let res = hash(Buffer.from("asd"))
console.log(res.h1.toString(16), res.h2.toString(16))

res = hash(Buffer.from("quick brown fox jumped over the fence"))
console.log(res.h1.toString(16), res.h2.toString(16))
*/

