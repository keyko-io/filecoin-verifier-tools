
const signer = require('@zondax/filecoin-signing-tools/js')

function makeMessage(data) {
  return {
    to: 't080',
    from: data.source,
    nonce: 0,
    value: '0',
    gasfeecap: '0',
    gaspremium: '0',
    gaslimit: 0,
    method: 0,
    params: Buffer.from(JSON.stringify(data)),
  }
}

function signMessage(msg, key) {
  const res = signer.transactionSign(makeMessage(msg), key.private_hexstring)
  res.message.params = res.message.params.toString('base64')
  res.signature = res.signature.data
  return res
}

function readMessage(msg) {
  if (!signer.verifySignature(msg.signature, msg.message)) {
    throw new Error('Signature mismatch')
  }
  const data = JSON.parse(Buffer.from(msg.message.params, 'base64'))
  return { ...data, source: msg.message.from }
}

exports.signMessage = signMessage
exports.readMessage = readMessage
