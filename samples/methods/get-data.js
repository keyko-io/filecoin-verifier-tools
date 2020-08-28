
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
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

exports.load = async function (a) {
  const res = await client.chainGetNode(a)
  return res.Obj
}

exports.getData = async function (path) {
  const head = await client.chainHead()
  const state = head.Blocks[0].ParentStateRoot['/']
  return (await client.chainGetNode(`${state}/${path}`)).Obj
}
