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

async function main() {
  const tx = await api.getTxFromMsgCid('bafy2bzacecwcemtcctinqjjrjcnchds5ceiqaffac6vlp4mn5i4plsb5cohcw')
  console.log('TRANSACTION', tx)
}

main()
