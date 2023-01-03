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
), mockWallet
)


async function main() {
  console.log('here', methods.encodeAddVerifier('t01003', 100000000000000000000000000000000000000000n).params.toString('hex'))

  await api.approveVerifier('t01003', 100000000000000000000000000000000000000000n, 't0101', 0, 2)
  process.exit(0)
}

main()
