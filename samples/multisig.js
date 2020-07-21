
const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt')
// const CID = require('cids')
const fs = require('fs')
const varint = require('varint')
const signer = require("@Zondax/filecoin-signing-tools")
const cbor = require('cbor')

const endpointUrl = 'ws://localhost:1234/rpc/v0'
const provider = new Provider(endpointUrl, {token: async () => {
    return fs.readFileSync('/home/sami/.lotus/token')
}})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

async function load(a) {
    let res = await client.chainGetNode(a)
    return res.Obj
}

async function run () {
    while (true) {
      const head = await client.chainHead()
      const state = head.Blocks[0].ParentStateRoot['/']
      console.log("height", head.Height, state)
      const data = (await client.chainGetNode(`${state}/@Ha:t0101/1/6`)).Obj
      console.log(JSON.stringify(data, null, 2))
      await hamt.forEach(data, load, function (k,v) {
          let [target, value, method, params, signers] = v
          let [verifier, cap] = cbor.decode(params)
          console.log(
              "key", varint.decode(k),
              "target", signer.bytesToAddress(target, true),
              "value sent", hamt.bytesToBig(value),
              "method", method,
              "params", [signer.bytesToAddress(verifier, true), hamt.bytesToBig(cap)],
              "signers", signers.map(a => signer.bytesToAddress(a, true)))
      })
      await new Promise(resolve => { setTimeout(resolve, 1000) })
    }
}

run()
