import VerifyAPI from '../../api/api.js'
import MockWallet from '../mockWallet.js'
import { methods as m } from '../../filecoin/methods.js'
import { lotus_endpoint, token_path, rootkey_mnemonic, path } from '../constants.js'
import { readFileSync } from 'fs'
const endpointUrl = lotus_endpoint
const tokenPath = token_path
const methods = m.testnet

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
  const accts = await mockWallet.getAccounts()
  console.log(accts)
  const textile = accts[3]

  const m0_addr = await api.newMultisig([textile], 1, 1000n, 3)
  console.log('M0', m0_addr)

  /*

  const slate = accts[4]
  const m1_addr = await api.newMultisig([textile, slate], 2, 3)
  console.log('M1', m1_addr)

  // add this to M0
  const receipt3 = await api.multisigAdd(m0_addr, m1_addr, 3)
  console.log(receipt3)
  */

  process.exit(0)
}

main()
