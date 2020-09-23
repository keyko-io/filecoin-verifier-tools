
const Sequelize = require('sequelize')
const constants = require('../samples/constants')
const schema = require('./schema')
const methods = require('../filecoin/methods')

const postgresConnUrl = constants.postgres_conn_url
const sequelize = new Sequelize(postgresConnUrl)

const Transaction = sequelize.define('transaction', schema.db)

async function run() {
  await sequelize.authenticate()

  await Transaction.sync()

  const res = await Transaction.findAll({
    where: {
      to_address: 't080',
    },
    order: ['height'],
  })

  // console.log(res)

  for (const { dataValues } of res) {
    // console.log(dataValues)
    console.log(methods.parse({ ...dataValues, to: dataValues.to_address }))
  }

  sequelize.close()
}

run()
