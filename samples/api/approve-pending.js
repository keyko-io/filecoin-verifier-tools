import VerifyAPI from '../../api/api.js'
import MockWallet from '../mockWallet.js'
import { methods as m } from '../../filecoin/methods.js'
import { readFileSync } from 'fs'

import { lotus_endpoint, token_path, rootkey_mnemonic, path } from '../constants.js'

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
), mockWallet
)

async function main() {
  const lst = await api.pendingRootTransactions()
  console.log(mockWallet.getAccounts())
  for (const { tx, id } of lst) {
    await api.send(methods.rootkey.approve(id, tx), 3)
  }
  process.exit(0)
}

main()
