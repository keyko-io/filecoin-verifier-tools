const fs = require('fs')
const VerifyAPI = require('../../api/api.js')
const MockWallet = require('../mockWallet')
const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const constants = require("../constants")

async function run () {

    let endpointUrl = constants.lotus_endpoint
    let tokenPath = constants.token_path 

    const provider = new Provider(endpointUrl, {
        token: async () => {
            return fs.readFileSync(tokenPath)
        }
    })

    const client = new LotusRPC(provider, { schema: testnet.fullNode })
  
    const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
    const path = "m/44'/1'/1/0/"
    const mockWallet = new MockWallet(mnemonic, path)

    const api = new VerifyAPI(client, mockWallet)
    
    var address= "t1rxk2ynia27jb6cs5r7xcgydm72p5ouu4js6lsbi"
    var datacap = 10000000000000000000000n
    //await api.verifyClient(address, datacap, 2)


    while (true) {
        
        var verifiers =  await api.listVerifiers()       
        var clients =  await api.listVerifiedClients()

        console.log("edfdf")

        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }

}

run()


 