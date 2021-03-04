
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
  console.log('height', head.Height)
  const actor = await client.stateGetActor('t06', head.Cids)
  console.log('actor', actor)
  const clients = (await client.chainGetNode(`${actor.Head['/']}/2`)).Obj
  // console.log(JSON.stringify(clients, null, 2))
  const dta = methods.decode(schema, clients)
  console.log(await dta.asObject(load))
  console.log(await dta.find(load, process.argv[2] || 't01005'))
  process.exit(0)
}

run()
