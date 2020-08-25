
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const methods = require('../../filecoin/methods')
const fs = require('fs')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const provider = new Provider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

async function load(a) {
  const res = await client.chainGetNode(a)
  return res.Obj
}

async function run() {
  while (true) {
    const head = await client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
    console.log('height', head.Height, state)
    const data = (await client.chainGetNode(`${state}/@Ha:t080/1/6`)).Obj
    console.log(JSON.stringify(data, null, 2))
    const info = methods.decode(methods.pending, data)
    const obj = await info.asObject(load)
    for (const [k, v] of Object.entries(obj)) {
      console.log(k, v, methods.parse(v))
    }
    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}

run()
