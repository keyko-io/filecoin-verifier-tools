import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { NodejsProvider as Provider } from '@filecoin-shipyard/lotus-client-provider-nodejs'
import { mainnet } from '@filecoin-shipyard/lotus-client-schema'
import { readFileSync } from 'fs'
import { keyDerive } from '@zondax/filecoin-signing-tools/js'
import { methods as mth } from '../filecoin/methods'
import { lotus_endpoint, token_path, verifier_mnemonic, path, rootkey_mnemonic } from './constants'
import MockWallet from './mockWallet'

const methods = mth.testnet
const provider = new Provider(lotus_endpoint, {
  token: async () => {
    return readFileSync(token_path)
  },
})

const client = new LotusRPC(provider, { schema: mainnet.fullNode })

const mockWallet = new MockWallet(verifier_mnemonic, path)

const key = keyDerive(verifier_mnemonic, `${path}/2`, '')
console.log('verifier address', key.address)

const key2 = keyDerive(rootkey_mnemonic, `${path}/2`, '')
console.log('rootkey address', key2.address)

async function main() {
  await methods.sendTx(client, 2, mockWallet, methods.encodeSend('t01000'))
  process.exit(0)
}

main()
