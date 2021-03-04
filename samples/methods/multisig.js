
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { mainnet } = require('@filecoin-shipyard/lotus-client-schema')
const methods = require('../../filecoin/methods').testnet
const fs = require('fs')
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
