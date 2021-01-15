
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { mainnet } = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const methods = require('../../filecoin/methods').testnet
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const provider = new Provider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
})

const client = new LotusRPC(provider, { schema: mainnet.fullNode })

async function load(a) {
  console.log('here')
  const res = await client.chainGetNode(a)
  return res.Obj
}

const schema = {
  type: 'hamt',
  key: 'address',
  value: 'bigint',
}

async function run() {
  const head = await client.chainHead()
  const state = head.Blocks[0].ParentStateRoot['/']
  console.log('height', head.Height, state)
  const clients = (await client.chainGetNode(`${state}/1/@Ha:t06/1/2`)).Obj
  // console.log(JSON.stringify(clients, null, 2))
  const dta = methods.decode(schema, clients)
  console.log(await dta.asObject(load))
  console.log(await dta.find(load, process.argv[2] || 't01004'))
}

run()
