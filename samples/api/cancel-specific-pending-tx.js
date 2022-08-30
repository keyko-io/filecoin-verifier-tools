const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const methods = require('../../filecoin/methods').testnet
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const token = constants.lotus_token

const mockWallet = new MockWallet(constants.rootkey_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token 
}), mockWallet)

async function main() {
   const tx = await api.getTxFromMsgCid('bafy2bzacecwcemtcctinqjjrjcnchds5ceiqaffac6vlp4mn5i4plsb5cohcw')
  console.log("TRANSACTION", tx)
  // console.log(mockWallet.getAccounts())
  // for (const { tx, id } of lst) {
   console.log("PENDING TRANSACTIONS:", await api.pendingTransactions("t01021"))
   const res= await api.send(methods.rootkey.cancel(tx.id, tx.tx), 2)
   console.log(res)
   console.log("PENDING TRANSACTIONS:", await api.pendingTransactions("t01021"))
  // }
  process.exit(0)
}

main()
