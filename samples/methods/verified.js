import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { NodejsProvider as Provider } from '@filecoin-shipyard/lotus-client-provider-nodejs'
import { mainnet } from '@filecoin-shipyard/lotus-client-schema'
import { readFileSync } from 'fs'
import { lotus_endpoint, token_path } from '../constants.js'
import { methods as m } from '../../filecoin/methods.js'

const methods = m.testnet
const endpointUrl = lotus_endpoint
const tokenPath = token_path

const provider = new Provider(endpointUrl, {
  token: async () => {
    return readFileSync(tokenPath)
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
  const dta = methods.decode(schema, clients)
  for (const it of await dta.asList(load)) {
    console.log(it)
  }
  console.log(await dta.find(load, 't01005'))
  await provider.destroy()
}

run()
