
const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const fs = require('fs')
const signer = require("@zondax/filecoin-signing-tools")
const mysigner = require("./signer")
const cbor = require('cbor')
const utils = require('./utils')
const { ProtocolIndicator } = require("./constants");

const endpointUrl = 'ws://localhost:1234/rpc/v0'
const provider = new Provider(endpointUrl, {token: async () => {
    return fs.readFileSync('/home/sami/.lotus/token')
}})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")
console.log("address", key.address)

  
function transactionSign(message, privateKey) {

    console.log("ser1", Buffer.from(signer.transactionSerializeRaw(message)).toString("hex"))
    console.log("ser2", mysigner.transactionSerializeRaw(message).toString("hex"))

    const signature = Buffer.from(signer.transactionSignRaw(message, privateKey));
    console.log(signature)
  
    return JSON.stringify({
      Message: {
        From: message.from,
        GasLimit: message.gaslimit,
        GasPrice: message.gasprice,
        Method: message.method,
        Nonce: message.nonce,
        Params: Buffer.from(message.params, "hex").toString("base64"),
        To: message.to,
        Value: message.value,
      },
      Signature: {
        Data: signature.toString("base64"),
        Type: ProtocolIndicator.SECP256K1,
      },
    });
  }

async function sendTx(to, method, params) {
    const head = await client.chainHead()
    let state = await client.stateGetActor(key.address, head.Cids)
    console.log(params)
    console.log(state)
    let msg = {
        "to": to,
        "from": key.address,
        "nonce": state.Nonce,
        "value": "123456789",
        "gasprice": "0",
        "gaslimit": 25000,
        "method": method,
        "params": params,
    }
    // let signed_str1 = transactionSign(msg, key.private_hexstring)
    let signed_str = mysigner.transactionSignLotus(msg, key.private_hexstring)
    console.log(signed_str)
    await client.mpoolPush(JSON.parse(signed_str))
    process.exit(0)
}

function encodeBig(bn) {
    return Buffer.from('00' + bn.toString(16), 'hex')
}

async function sendVerify(verified, cap) {
    console.log([utils.addressAsBytes(verified), encodeBig(cap)])
    await sendTx("t06", 4, cbor.encode([utils.addressAsBytes(verified), encodeBig(cap)]))
}

// sendTx("t17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy", 0, "")

sendVerify("t1uu7jrpff4sh7g2clfjv7oc2oafui5hrlxeuax7q", 123456789101112n)
