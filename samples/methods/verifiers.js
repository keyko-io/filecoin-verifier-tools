import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { NodejsProvider as Provider } from '@filecoin-shipyard/lotus-client-provider-nodejs'
import { mainnet } from '@filecoin-shipyard/lotus-client-schema'
import { readFileSync } from 'fs'
import { lotus_endpoint, token_path } from '../constants.js'
const endpointUrl = lotus_endpoint
const tokenPath = token_path

const provider = new Provider(endpointUrl, {
  token: async () => {
    return readFileSync(tokenPath)
  },
})

const client = new LotusRPC(provider, { schema: mainnet.fullNode })

// async function load(a) {
//   const res = await client.chainGetNode(a)
//   return res.Obj
// }

// function print(k, v) {
//   console.log(methods.decode('address', k), methods.decode('bigint', v))
// }

async function run() {
  while (true) {
    console.log('here')
    const head = await client.chainHead()
    console.log('height', head.Height)
    const actor = await client.stateGetActor('t06', head.Cids)
    console.log('actor', actor)
    const verifiers = (await client.chainGetNode(`${actor.Head['/']}/1`)).Obj
    // const verifiers = (await client.chainGetNode(`${state}/1/@Ha:t06/1/1`)).Obj
    console.log(JSON.stringify(verifiers, null, 2))
    // await forEach(verifiers, load, print)

    // console.log(await buildArrayData(verifiers, load))

    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}

run()
