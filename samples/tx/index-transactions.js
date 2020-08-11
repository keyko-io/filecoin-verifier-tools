const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { NodejsProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../../hamt/hamt')
const methods = require('../../filecoin/methods')
const fs = require('fs')
const message = require('./message')
const constants = require("../constants")

const Sequelize = require('sequelize')

// create database lotus;
const sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/lotus')

let endpointUrl = constants.lotus_endpoint
let tokenPath = constants.token_path 

const provider = new Provider(endpointUrl, {
    token: async () => {
        return fs.readFileSync(tokenPath)
    }
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })

const Transaction = sequelize.define('transaction', message.db)

async function handleMessages(i, dta) {
    if (dta[1] != 0) {
        // console.log(i, dta[2][2])
        for (let e of dta[2][2]) {
            const msg = (await client.chainGetNode(e['/'])).Obj
            let tx
            if (msg.length == 2) {
                tx = methods.decode(message.message, hamt.makeBuffers(msg[0]))
            }
            else {
                tx = methods.decode(message.message, hamt.makeBuffers(msg))
            }
            console.log(tx)
            let obj = new Transaction({ ...tx, height: i})
            await obj.save()
        }
    }
}

async function run() {

    await sequelize.authenticate()

    Transaction.sync()

    for (let i = 1; i < 4000; i++) {
        const ts = await client.chainGetTipSetByHeight(i, null)
        // TODO: handle other blocks in tipset
        let msg = ts.Blocks[0].Messages['/']
        const data = (await client.chainGetNode(msg)).Obj
        const d1 = (await client.chainGetNode(data[0]['/'])).Obj
        const d2 = (await client.chainGetNode(data[1]['/'])).Obj
        handleMessages(i, d1)
        handleMessages(i, d2)
    }
    await client.destroy()
}

run()
