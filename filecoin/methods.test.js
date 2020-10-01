
const { encodeAddVerifier, encodeAddVerifiedClient, verifreg, decode, encodePropose, rootkey, multisig, encodeApprove } = require('./methods').testnet

describe('encoding and decoding', () => {
  it('add verifier', () => {
    const res = encodeAddVerifier('t0109', 123456789n)
    const res2 = verifreg.addVerifier('t0109', 123456789n)
    expect(res).toStrictEqual(res2)
    expect(decode(['cbor', ['address', 'bigint']], res.params)).toStrictEqual(['t0109', 123456789n])
  })

  it('add verified client', () => {
    const res = encodeAddVerifiedClient('t0102', 1234567n)
    const res2 = verifreg.addVerifiedClient('t0102', 1234567n)
    expect(res).toStrictEqual(res2)
    expect(decode(['cbor', ['address', 'bigint']], res.params)).toStrictEqual(['t0102', 1234567n])
  })

  it('multisig propose transaction', () => {
    const res = encodeAddVerifiedClient('t0102', 1234567n)
    const res2 = encodePropose('t080', res)
    const res3 = rootkey.propose(res)
    expect(res2).toStrictEqual(res3)
    const schema = multisig[2].input
    expect(decode(['cbor', schema], res2.params)).toStrictEqual(res)
  })

  it('multisig approve transaction', () => {
    const res = encodeAddVerifiedClient('t0102', 1234567n)
    const res2 = encodeApprove('t080', 12, 't01001', res)
    const res3 = rootkey.approve(12, { ...res, from: 't01001' })
    expect(res2).toStrictEqual(res3)
  })
})
