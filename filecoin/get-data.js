
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')

exports.make = function (endpointUrl) {
  const provider = new Provider(endpointUrl)

  const client = new LotusRPC(provider, { schema: testnet.fullNode })

  return {
    load: async function (a) {
      const res = await client.chainGetNode(a)
      return res.Obj
    },

    getData: async function (path) {
      const head = await client.chainHead()
      const state = head.Blocks[0].ParentStateRoot['/']
      return (await client.chainGetNode(`${state}/${path}`)).Obj
    },
  }
}
