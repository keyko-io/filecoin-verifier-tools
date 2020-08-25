
/*
Instead of these we can use something that will get graphql from postgres like hasura

Sample query:
{
  transactions(where: {to_address: {_eq: "t080"}}) {
    to_address
    from_address
    gas_limit
  }
}
*/

const express = require('express')
const Sequelize = require('sequelize')
const message = require('./message')
const constants = require('../constants')

const app = express()
const port = 3000
app.use(express.json())

const postgresConnUrl = constants.postgres_conn_url
const sequelize = new Sequelize(postgresConnUrl)

const Transaction = sequelize.define('transaction', message.db)

async function run() {
  await sequelize.authenticate()
  Transaction.sync()
  app.get('/', (_, res) => res.json({ message: 'Hello World' }))

  app.get('/from/:address', async (req, res) => {
    const address = req.params.address
    console.log(address)
    try {
      const lst = await Transaction.findAll({
        where: {
          from_address: address,
        },
      })
      const process = tx => {
        tx.params = Buffer.from(tx.params).toString('base64')
        return tx
      }
      res.json({ txs: lst.map(process) })
      // res.json({ txs: lst.map(tx => ({...tx, params: Buffer.from(tx.params).toString("base64")})) })
    } catch (error) {
      console.error(error)
    }
  })
  app.listen(port, () => console.log(`App listening on port ${port}!`))
}

run()
