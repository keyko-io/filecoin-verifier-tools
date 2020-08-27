// Adding users to the DB

const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const Sequelize = require('sequelize')
const constants = require('../samples/constants')
const fs = require('fs')
const methods = require('../filecoin/methods')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const provider = new Provider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

async function load(a) {
  const res = await client.chainGetNode(a)
  return res.Obj
}

const postgresConnUrl = constants.postgres_conn_url
const sequelize = new Sequelize(postgresConnUrl)

const Users = sequelize.define('users', {
  address: {
    type: Sequelize.STRING,
  },
  key: {
    type: Sequelize.STRING,
  },
  kind: {
    type: Sequelize.STRING,
  },
})

async function getVerifiers() {
  const head = await client.chainHead()
  const state = head.Blocks[0].ParentStateRoot['/']
  const verifiers = (await client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
  const list = methods.decode({ type: 'hamt', key: 'address', value: 'bigint' }, verifiers)
  return (await list.asList(load)).map(([a, _]) => a)
}

async function getRootKeys() {
  const head = await client.chainHead()
  const state = head.Blocks[0].ParentStateRoot['/']
  const data = (await client.chainGetNode(`${state}/@Ha:t080/1`)).Obj
  return methods.decode(['list', 'address'], data[0])
}

async function getKey(addr) {
  try {
    const head = await client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
    const data = (await client.chainGetNode(`${state}/@Ha:${addr}/1`)).Obj
    return methods.decode('address', data[0])
  }
  catch (err) {
    console.log(`Cannot find key for ${addr} ${err}`)
    return null
  }
}

async function run() {
  await Users.sync()
  const verifiers = await getVerifiers()
  const rootkeys = await getRootKeys()
  for (const v of verifiers) {
    const obj = new Users({ address: v, kind: 'verifier', key: await getKey(v) })
    await obj.save()
  }
  for (const v of rootkeys) {
    const obj = new Users({ address: v, kind: 'rootkey', key: await getKey(v) })
    await obj.save()
  }
  process.exit(0)
}

run()
