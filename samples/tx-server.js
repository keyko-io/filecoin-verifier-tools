const express = require('express')
const Sequelize = require('sequelize')
const message = require('./message')

const app = express()
const port = 3000
app.use(express.json());

const sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/lotus')

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
                    from_address: address
                }
            })
            let process = tx => {
                tx.params = Buffer.from(tx.params).toString("base64")
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
