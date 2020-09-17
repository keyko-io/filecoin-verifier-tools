const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require('@zondax/filecoin-signing-tools/js')
const methods = require('../filecoin/methods')
const constants = require('./constants')

const provider = new Provider(constants.lotus_endpoint, {
  token: async () => {
    return fs.readFileSync(constants.token_path)
  },
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

const key = signer.keyDerive(constants.verifier_mnemonic, `${constants.path}/2`, '')
console.log('verifier address', key.address)

const key2 = signer.keyDerive(constants.rootkey_mnemonic, `${constants.path}/2`, '')
console.log('rootkey address', key2.address)

async function main() {
  await methods.sendTx(client, key, methods.encodeSend('t01000'))
  process.exit(0)
}

main()
