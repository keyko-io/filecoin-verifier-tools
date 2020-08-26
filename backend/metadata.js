// Adding metadata to the DB

const Sequelize = require('sequelize')
const constants = require('../samples/constants')
const jayson = require('jayson')
const secp256k1 = require('secp256k1')
const blake = require('blakejs')
const signer = require('@zondax/filecoin-signing-tools')
const address = require('@openworklabs/filecoin-address')

const postgresConnUrl = constants.postgres_conn_url
const sequelize = new Sequelize(postgresConnUrl)

const VerifierMetadata = sequelize.define('VerifierMetadata', {
  address: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.TEXT,
  },
  source: {
    type: Sequelize.STRING,
  },
})

function getPayloadSECP256K1(uncompressedPublicKey) {
  const blakeCtx = blake.blake2bInit(20)
  blake.blake2bUpdate(blakeCtx, uncompressedPublicKey)
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

function getDigest({ address, source, description }) {
  const blakeCtx = blake.blake2bInit(32)
  blake.blake2bUpdate(blakeCtx, JSON.stringify({ address, source, description }))
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

function signMessage(msg, privateKey) {
  const signature = secp256k1.ecdsaSign(getDigest(msg), Buffer.from(privateKey, 'hex'))

  return { recid: signature.recid, signature: Buffer.from(signature.signature).toString('base64') }
}

function checkSignature(msg) {
  const digest = getDigest(msg)
  const publicKey = secp256k1.ecdsaRecover(
    Buffer.from(msg.signature.signature, 'base64'),
    msg.signature.recid,
    digest,
    false,
  )
  const payload = getPayloadSECP256K1(Buffer.from(publicKey))
  if (address.encode('t', address.newAddress(1, payload)) !== msg.source) {
    throw new Error('Signature didn\'t match')
  }
}

// create a server
const server = jayson.server({
  addVerifierMetadata: async function (msg, callback) {
    checkSignature(msg)
    const obj = new VerifierMetadata(msg)
    await obj.save()
    callback(null, null)
  },
})

const port = 3000

const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
const path = "m/44'/1'/1/0/2"

async function run() {
  const key = signer.keyDerive(mnemonic, path, '')
  const msg = {
    address: 't01009',
    source: key.address,
    description: 'something',
  }
  msg.signature = signMessage(msg, key.private_hexstring)
  console.log(JSON.stringify(msg))
  checkSignature(msg)

  await sequelize.authenticate()
  VerifierMetadata.sync()
  server.http().listen(port)
}

run()
