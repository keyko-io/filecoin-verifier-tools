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
), mockWallet
)

async function main() {
  const lst = await api.listVerifiers()
  console.log(lst)
  for (const { verifier } of lst) {
    console.log(verifier, await api.checkVerifier(verifier))
  }
  // console.log('t01003', await api.checkVerifier('t01003'))
  const lst2 = await api.listVerifiedClients()
  console.log(lst2)
  for (const { verified } of lst2) {
    console.log(verified, await api.checkClient(verified))
  }
  // console.log('t01005', await api.checkClient('t01005'))
  process.exit(0)
}

main()
