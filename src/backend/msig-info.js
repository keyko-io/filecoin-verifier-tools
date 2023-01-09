
const Sequelize = require('sequelize')
const constants = require('../samples/constants')
const schema = require('./schema')
const methods = require('../filecoin/methods').testnet

const postgresConnUrl = constants.postgres_conn_url
const sequelize = new Sequelize(postgresConnUrl)

const Transaction = sequelize.define('transaction', schema.db)

async function run() {
  await sequelize.authenticate()

  await Transaction.sync()

  const res = await Transaction.findAll({
    where: {
      to_address: 't01',
    },
    order: ['height'],
  })

  // console.log(res)

  for (const { dataValues } of res) {
    console.log(dataValues)
    const res = methods.parse({ ...dataValues, to: dataValues.to_address })
    console.log(res)
    console.log(res.params.cid)
    console.log(methods.decode(['cbor', { signers: ['list', 'address'], threshold: 'int', unlockDuration: 'int' }], res.params.params))
  }

  sequelize.close()
}

run()
