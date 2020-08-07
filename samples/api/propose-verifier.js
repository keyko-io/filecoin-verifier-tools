const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require("@keyko-io/filecoin-signing-tools/js")
const constants = require("../constants")

let endpointUrl = constants.lotus_endpoint
let tokenPath = constants.token_path 

const provider = new Provider(endpointUrl, {token: async () => {
    return fs.readFileSync(tokenPath)
}})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
const path = "m/44'/1'/1/0/"
const mockWallet = new MockWallet(mnemonic, path)
const api = new VerifyAPI(client, mockWallet)

async function main() {
    
    await api.proposeVerifier("t01004", 100000000000000000000000000000000000000000n, 2)
    process.exit(0)
}

main()
