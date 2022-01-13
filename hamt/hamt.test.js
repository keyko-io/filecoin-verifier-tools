
const { nextBits, indexForBitPos, readVarInt, find, bytesToBig, buildArrayData, makeBuffers } = require('./hamt')

describe('nextBits()', () => {
  it('should work', () => {
    const obj = { left: 30, num: 0b1111100000111010001110101n }

    expect(nextBits(obj, 5)).toBe(0b00000n)
    expect(nextBits(obj, 5)).toBe(0b11111n)
    expect(nextBits(obj, 5)).toBe(0b00000n)
    expect(nextBits(obj, 5)).toBe(0b11101n)
    expect(nextBits(obj, 5)).toBe(0b00011n)
    expect(nextBits(obj, 5)).toBe(0b10101n)
  })
})

describe('indexForBitPos()', () => {
  it('should work', () => {
    expect(indexForBitPos(10, 0xf0f0f00f0ff0f0n)).toBe(4)
    expect(indexForBitPos(0, 0xf0f0f00f0ff0f0n)).toBe(0)
  })
})

describe('readVarInt()', () => {
  it('should work', () => {
    expect(readVarInt(Buffer.from('AOkH', 'base64'), 1)).toBe(1001n)
    expect(readVarInt(Buffer.from('AFA=', 'base64'), 1)).toBe(80n)
  })
})

const data = [
  {'/': {bytes:'IkAAAA=='}},
  [
    [
      [
        {'/': {bytes:'AOsH'}},
        {'/': {bytes:'AAEl36NxoZ5vepcb1EmRplwAAA=='}},
      ],
    ],
    [
      [
        {'/': {bytes:'AOwH'}},
        {'/': {bytes:'AAEl36NxoZ5vfLVDlcoAAAAAAA=='}},
      ],
    ],
    [
      [
        {'/': {bytes:'AFE='}},
        {'/': {bytes:''}},
      ],
    ],
  ],
]

function load() {
  throw new Error('not implemented')
}

describe('find()', () => {
  it('should work', async () => {
    const res = await find(data, load, Buffer.from('AOwH', 'base64'))
    expect(bytesToBig(res)).toBe(100000000000000000000000000000000000000000n)
  })
  it('should work', async () => {
    const res = await find(makeBuffers(data), load, Buffer.from('AOwH', 'base64'))
    expect(bytesToBig(res)).toBe(100000000000000000000000000000000000000000n)
  })
  it('handle not found', async () => {
    await expect(async () => await find(data, load, Buffer.from('123456', 'hex'))).rejects.toThrow('not found in bitfield')
  })
})

describe('buildArrayData()', () => {
  it('should work', async () => {
    const res = await buildArrayData(data, load)
    expect(res.map(([a, _]) => a)).toStrictEqual(['t01003', 't01004', 't081'])
  })
})
