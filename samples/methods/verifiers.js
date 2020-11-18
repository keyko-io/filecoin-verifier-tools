
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { mainnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../../hamt/hamt')
const fs = require('fs')
const constants = require('../constants')
const methods = require('../../filecoin/methods')

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

function print(k, v) {
  console.log(methods.decode('address', k), methods.decode('bigint', v))
}

async function run() {
  while (true) {
    console.log('here')
    const head = await client.chainHead()
    console.log('height', head.Height)
    const state = head.Blocks[0].ParentStateRoot['/']
    console.log('height', head.Height, state)
    const verifiers = (await client.chainGetNode(`${state}/1/@Ha:t06/1/1`)).Obj
    console.log(JSON.stringify(verifiers, null, 2))
    await hamt.forEach(verifiers, load, print)

    console.log(await hamt.buildArrayData(verifiers, load))

    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}

run()
