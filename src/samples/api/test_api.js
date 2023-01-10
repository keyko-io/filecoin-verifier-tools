import VerifyAPI, { standAloneProvider } from '../../api/api.js'
import MockWallet from '../mockWallet'
import { verifier_mnemonic, path } from '../constants'
async function run() {
  const mockWallet = new MockWallet(verifier_mnemonic, path)
  const api = new VerifyAPI(standAloneProvider('https://node.glif.io/space06/lotus/rpc/v0'
    , {
      token: async () => {
        return ''
      },
    }), mockWallet)
  while (true) {
    const verifiers = await api.listVerifiers()
    const clients = await api.listVerifiedClients()
    console.log(verifiers, clients)
    // console.log('actor', await api.actorAddress('t1cncuf2kvfzsmsij3opaypup527ounnpwhiicdci'))
    // console.log('actor', await api.actorKey('t0102'))
    await new Promise(resolve => { setTimeout(resolve, 1000) })
  }
}
run()
