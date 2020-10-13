
const methods = require('./methods')
const { encodeAddVerifier, encodeAddVerifiedClient, verifreg, decode, encodePropose, rootkey, multisig, encodeApprove } = require('./methods')

const precommitData = [
  'Ag==',
  [
    {
      1: [
        [
          'Aw==',
          [
            [
              0,
              3,
              {
                '/': 'bagboea4b5abcaz2agtrhorad327din3udimabrvwjxervgnd6dgds7wlwdla7qsq',
              },
              -520,
              [
                3,
              ],
              1025937,
              false,
              0,
              0,
              0,
            ],
            'ABT0tcB+',
            381,
            'AB6NTgA=',
            '',
          ],
        ],
      ],
    },
  ],
]

const precommitResult = {
  info: {
    seal_proof: 0,
    sector_number: 3,
    sealed_cid: 'bagboea4b5abcaz2agtrhorad327din3udimabrvwjxervgnd6dgds7wlwdla7qsq',
    seal_rand_epoch: -520,
    deal_ids: [3],
    expiration: 1025937,
    replace_capacity: false,
    replace_sector_deadline: 0,
    replace_sector_partition: 0,
    replace_sector_number: 0,
  },
  precommit_deposit: 90004897918n,
  precommit_epoch: 381,
  deal_weight: 512577024n,
  verified_deal_weight: 0n,
}

const precommit = {
  type: 'hamt',
  key: 'bigint-key',
  value: {
    info: {
      seal_proof: 'int',
      sector_number: 'int',
      sealed_cid: 'cid',
      seal_rand_epoch: 'int',
      deal_ids: ['list', 'int'],
      expiration: 'int',
      replace_capacity: 'bool',
      replace_sector_deadline: 'int',
      replace_sector_partition: 'int',
      replace_sector_number: 'int',
    },
    precommit_deposit: 'bigint',
    precommit_epoch: 'int',
    deal_weight: 'bigint',
    verified_deal_weight: 'bigint',
  },
}

const tx = {
  params: Buffer.from('8442000640025819824300ec0753000125dfa371a19e6f7cb54395ca0000000000', 'hex'),
  to: 't080',
  from: 't1cncuf2kvfzsmsij3opaypup527ounnpwhiicdci',
  method: 2,
}

const parsedTx = {
  name: 'propose',
  params: {
    to: 't06',
    value: 0n,
    method: 2,
    params: Buffer.from('824300ec0753000125dfa371a19e6f7cb54395ca0000000000', 'hex'),
  },
  parsed: {
    name: 'addVerifier',
    params: {
      verifier: 't01004',
      cap: 100000000000000000000000000000000000000000n,
    },
    parsed: null,
  },
}

const multisigData = [
  [
    'AGU=',
  ],
  1,
  3,
  'AClb6W5kBmlyAAAA',
  0,
  0,
  {
    '/': 'bafy2bzaceamp42wmmgr2g2ymg46euououzfyck7szknvfacqscohrvaikwfay',
  },
]

const multisigState = {
  signers: ['t0101'],
  threshold: 1,
  next_txn_id: 3,
  initial_balance: 50000000000000000000000000n,
  start_epoch: 0,
  unlock_duration: 0,
}

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

  it('parse tx', () => {
    expect(methods.parse(tx)).toEqual(parsedTx)
  })

  it('decode with bad schema', () => {
    expect(() => methods.decode('gurp', 123)).toThrow('gurp')
  })

  it('encode with bad schema', () => {
    expect(() => methods.encode('gurp', 123)).toThrow('gurp')
  })

  it('msig state', () => {
    expect(methods.decode(methods.msig_state, multisigData)).toMatchObject(multisigState)
  })

  it('msig constructor', () => {
    expect(methods.encode(methods.msig_constructor, [['t080'], 1, 0n]).toString('hex')).toEqual('83814200500100')
  })

  it('precommit info', async () => {
    const obj = methods.decode(precommit, precommitData)
    expect((await obj.asObject())[1]).toEqual(precommitResult)
    expect((await obj.asList()).length).toEqual(1)
    expect(await obj.find(null, 3n)).toEqual(precommitResult)
  })

  it('decode and encode list', () => {
    const res = methods.encode(['cbor', ['address', 'int']], ['t01001', 123])
    expect(methods.decode(['cbor', [['from', 'address'], ['value', 'int']]], res)).toEqual({ from: 't01001', value: 123 })
  })
})
