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
  ), mockWallet,
)

async function main() {
  console.log(methods.verifreg.removeVerifier(process.argv[2]).params.toString('hex'))
  const id = await api.removeVerifier(process.argv[2], 2)
  console.log(await api.getReceipt(id))
  process.exit(0)
}

main()
