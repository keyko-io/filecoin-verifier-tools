// Adding metadata to the DB

const Sequelize = require('sequelize')
const constants = require('../samples/constants')
const jayson = require('jayson')
const signer = require('@zondax/filecoin-signing-tools/js')
const offchainMessage = require('./offchain-message')
const schema = require('./schema')

const postgresConnUrl = constants.postgres_conn_url
const sequelize = new Sequelize(postgresConnUrl)

const VerifierMetadata = sequelize.define('verifiers', {
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

const ClientMetadata = sequelize.define('clients', {
  address: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.TEXT,
  },
  description: {
    type: Sequelize.TEXT,
  },
  source: {
    type: Sequelize.STRING,
  },
})

const Users = sequelize.define('users', schema.users)

async function addVerifierMetadata(msg) {
  const data = offchainMessage.readMessage(msg)
  const res = await Users.findAll({
    where: {
      key: data.source,
      kind: 'rootkey',
    },
  })
  if (res.length === 0) {
    throw new Error('Source is not a rootkey')
  }
  const obj = new VerifierMetadata(data)
  await obj.save()
}

async function addClientMetadata(msg) {
  const data = offchainMessage.readMessage(msg)
  const res = await Users.findAll({
    where: {
      key: data.source,
      kind: 'verifier',
    },
  })
  if (res.length === 0) {
    throw new Error('Source is not a verifier')
  }
  const obj = new ClientMetadata(data)
  await obj.save()
}

// create a server
const server = jayson.server({
  addVerifierMetadata: async function (msg, callback) {
    try {
      await addVerifierMetadata(msg)
      callback(null, 'ok')
    } catch (err) {
      console.log('Cannot add metadata', err)
      callback(err, null)
    }
  },
  addClientMetadata: async function (msg, callback) {
    try {
      await addClientMetadata(msg)
      callback(null, 'ok')
    } catch (err) {
      console.log('Cannot add metadata', err)
      callback(err, null)
    }
  },
})

const port = 3000

const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
const path = "m/44'/1'/0/0/2"

async function run() {
  const key = signer.keyDerive(mnemonic, path, '')
  const msg = {
    address: 't01009',
    source: key.address,
    description: 'something',
  }
  const res = offchainMessage.signMessage(msg, key)
  console.log(JSON.stringify(res))
  const asd = offchainMessage.readMessage(res)
  console.log(asd)

  await sequelize.authenticate()
  VerifierMetadata.sync()
  ClientMetadata.sync()
  server.http().listen(port)
}

run()
