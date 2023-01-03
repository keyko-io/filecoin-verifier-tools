import VerifyAPI from '../../api/api.js'
import MockWallet from '../mockWallet.js'
import { readFileSync } from 'fs'
import { lotus_endpoint, token_path, verifier_mnemonic, path } from '../constants.js'

const endpointUrl = lotus_endpoint
const tokenPath = token_path

const mockWallet = new MockWallet(verifier_mnemonic, path)

const api = new VerifyAPI(
  VerifyAPI.standAloneProvider(endpointUrl, {
    token: async () => {
      return readFileSync(tokenPath)
    },
  },
  ), mockWallet,
)

async function main() {
  const id = await api.verifyClient('t0120123', 10000000000000000000000n, 2, mockWallet)
  console.log('sent transaction', id)
  const receipt = await api.getReceipt(id)
  console.log('got receipt', receipt)
  process.exit(0)
}

main()
