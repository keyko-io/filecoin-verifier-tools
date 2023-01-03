import VerifyAPI from '../../api/api.js'
import MockWallet from '../mockWallet.js'
import { methods as m } from '../../filecoin/methods.js'
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
), mockWallet
)

async function main() {
  const msig = 't01014'
  const lst = await api.pendingTransactions(msig)

  for (const tx of lst) {
    console.log(tx)
    console.log(tx.parsed.parsed)
    // await api.approvePending(msig, tx, 3)
  }

  process.exit(0)
}

main()
