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

async function run() {
  while (true) {
    const head = await client.chainHead()
    console.log('height', head.Height)
    const actor = await client.stateGetActor('t080', head.Cids)
    console.log('actor', actor)
    const data = (await client.chainGetNode(actor.Head['/'])).Obj
    // console.log(JSON.stringify(data, null, 2))
    const info = methods.decode(methods.msig_state, data)
    console.log(info)
    const obj = await (await info.pending(load)).asObject(load)
    for (const [k, v] of Object.entries(obj)) {
      console.log(k, v, methods.parse(v))
    }
    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}

run()
