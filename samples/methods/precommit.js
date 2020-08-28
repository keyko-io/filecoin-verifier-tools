
const methods = require('../../filecoin/methods')
const { make } = require('../../filecoin/get-data')

/*
const testdata = [
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
*/

const schema = {
  type: 'hamt',
  key: 'bigint',
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

async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node samples/methods/precommit.js miner-address')
    process.exit(0)
  }
  // const obj = methods.decode(schema, testdata)
  // console.log(await obj.asObject())
  const { getData, load } = make('ws://localhost:1234/rpc/v0')
  const data = await getData(`@Ha:${process.argv[2]}/1/5`)
  console.log(await methods.decode(schema, data).asObject(load))
  process.exit(0)
}

main()
