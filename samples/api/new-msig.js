const VerifyAPI = require('../../api/api.js')
const methods = require('../../filecoin/methods.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const constants = require('../constants')
const cbor = require('cbor')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
}), mockWallet)

async function main() {
  console.log(mockWallet.getAccounts())
  let textile = process.argv[2]
  let slate = process.argv[3]
  const tx = methods.init.exec(methods.multisigCID, methods.encode(methods.msig_constructor, [[textile],1,0]))
  console.log(tx)
  // const tx2 = methods.rootkey.propose(tx)
  // console.log(tx2)
  console.log(methods.parse(tx))
  let txid = await api.send(tx, 2)
  let receipt = await api.getReceipt(txid)
  let [m0_addr] = methods.decode(['list', 'address'],cbor.decode(Buffer.from(receipt.Return, 'base64')))
  console.log(receipt)

  const tx2 = methods.init.exec(methods.multisigCID, methods.encode(methods.msig_constructor, [[textile, slate],2,0]))
  console.log(tx2)
  // const tx2 = methods.rootkey.propose(tx)
  // console.log(tx2)
  console.log(methods.parse(tx2))
  let txid2 = await api.send(tx2, 2)
  let receipt2 = await api.getReceipt(txid2)
  let [m1_addr] = methods.decode(['list', 'address'],cbor.decode(Buffer.from(receipt2.Return, 'base64')))
  console.log(receipt2)

  console.log(m0_addr, m1_addr)

  // add this to M0
  let m0_actor = methods.actor(m0_addr, methods.multisig)
  let tx3 = m0_actor.propose(m0_actor.addSigner(m1_addr, false))
  let txid3 = await api.send(tx3, 3)
  let receipt3 = await api.getReceipt(txid3)
  console.log(receipt3)

  process.exit(0)
}

main()
