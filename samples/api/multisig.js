import VerifyAPI from '../../api/api.js'
import MockWallet from '../mockWallet.js'
import { lotus_endpoint, token_path, rootkey_mnemonic, path } from '../constants.js'
import { readFileSync } from 'fs'
const endpointUrl = lotus_endpoint
const tokenPath = token_path

const mockWallet = new MockWallet(rootkey_mnemonic, path)

const api = new VerifyAPI(
  VerifyAPI.standAloneProvider(endpointUrl, {
    token: async () => {
      return readFileSync(tokenPath)
    },
  },
  ), mockWallet,
)

async function run() {
  console.log(Buffer.from('') instanceof Buffer)

  const info = await api.pendingRootTransactions()
  console.log(info)

  console.log(await api.listVerifiers())

  console.log(await api.listRootkeys())

  console.log(await api.multisigInfo('t080'))
  console.log(await api.pendingTransactions('t080'))

  process.exit(0)
}

run()
