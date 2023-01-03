import VerifyAPI from '../../api/api.js'
import MockWallet from '../mockWallet.js'

import { methods as m } from '../../filecoin/methods.js'
import { lotus_endpoint, token_path, rootkey_mnemonic, path } from '../constants.js'
import { readFileSync } from 'fs'

const methods = m.testnet
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

async function main() {
  const tx = methods.rootkey.addSigner('t0120123', true)
  console.log(tx)
  const tx2 = methods.rootkey.propose(tx)
  console.log(tx2)
  console.log(methods.parse(tx2))
  await api.send(tx2, 2)
  process.exit(0)
}

main()
