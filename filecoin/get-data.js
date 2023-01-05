
import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { NodejsProvider as Provider } from '@filecoin-shipyard/lotus-client-provider-nodejs'
import { mainnet } from '@filecoin-shipyard/lotus-client-schema'

export function make(endpointUrl) {
  const provider = new Provider(endpointUrl)

  const client = new LotusRPC(provider, { schema: mainnet.fullNode })

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
