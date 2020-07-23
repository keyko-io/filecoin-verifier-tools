const fs = require('fs')
const VerifyAPI = require('../api.js')
const signer = require("@keyko-io/filecoin-signing-tools/js")

async function run () {

    const endpointUrl = 'ws://localhost:1234/rpc/v0'
    const api = new VerifyAPI(endpointUrl, {token:  () => {
        return fs.readFileSync('/Users/jpfernandez/.lotus/token')
    }})

    const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
    let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")

    var address= "t13yfao4yi3jcq2ts32edop6qbxsvg3a23vbwm3qi"
    var datacap = 10000000000000000000000n
    await api.verifyClient(address, datacap, key)


    while (true) {
        
        var verifiers =  await api.listVerifiers()       
        var clients =  await api.listVerifiedClients()

        console.log("edfdf")

        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }

}

run()


 