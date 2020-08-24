const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../../hamt/hamt')
const methods = require('../../filecoin/methods')
const fs = require('fs')
const message = require('./message')
const constants = require('../constants')

const Sequelize = require('sequelize')

// create database lotus;
const sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/lotus')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const provider = new Provider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

const Transaction = sequelize.define('transaction', message.db)
const Block = sequelize.define('block', message.block)

async function handleMessages (height, blockhash, dta) {
  if (dta[1] !== 0) {
    for (const e of dta[2][2]) {
      const msg = (await client.chainGetNode(e['/'])).Obj
      let tx
      if (msg.length === 2) {
        tx = methods.decode(message.message, hamt.makeBuffers(msg[0]))
      } else {
        tx = methods.decode(message.message, hamt.makeBuffers(msg))
      }
      const obj = new Transaction({ ...tx, height, txhash: e['/'], blockhash })
      await obj.save()
    }
  }
}

const sleep = async (ms) => await new Promise(resolve => { setTimeout(resolve, ms) })

async function indexHeight (i) {
  const ts = await client.chainGetTipSetByHeight(i, null)
  // TODO: handle other blocks in tipset
  for (let j = 0; j < ts.Blocks.length; j++) {
    const block = ts.Blocks[j]
    const blockhash = ts.Cids[j]['/']
    const obj = new Block({ height: i, blockhash, miner: block.Miner, timestamp: block.Timestamp, parentweight: block.ParentWeight })
    await obj.save()
    const messages = block.Messages['/']
    const data = (await client.chainGetNode(messages)).Obj
    const d1 = (await client.chainGetNode(data[0]['/'])).Obj
    const d2 = (await client.chainGetNode(data[1]['/'])).Obj
    handleMessages(i, blockhash, d1)
    handleMessages(i, blockhash, d2)
  }
}

async function run () {
  await sequelize.authenticate()

  await Transaction.sync()
  await Block.sync()

  const max = await sequelize.query('SELECT max(height) FROM blocks', { type: sequelize.QueryTypes.SELECT })

  let cur_height = max[0].max
  while (true) {
    const head = await client.chainHead()
    const target_height = head.Height
    for (; cur_height < target_height; cur_height++) {
      await indexHeight(cur_height)
    }
    sleep(1000)
  }
}

run()
