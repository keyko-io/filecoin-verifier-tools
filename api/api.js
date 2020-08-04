const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt/hamt')
// const CID = require('cids')
const fs = require('fs')
const address = require('@openworklabs/filecoin-address')
const methods = require('../filecoin/methods')



class VerifyAPI {

    constructor (lotusEndoint, token) {
        var provider = new Provider(lotusEndoint, token)
        this.client = new LotusRPC(provider, { schema: testnet.fullNode })
    }

    async load(a) {
        let res = await this.client.chainGetNode(a)
        return res.Obj
    }

    async listVerifiers() {

        const head = await this.client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        const verifiers = (await this.client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
        
        return  await hamt.buildArrayData(verifiers, this.load)
      
   }

   async checkVerifier(verifierAddress) {

     // empty array if not verifier is present
     return this.listVerifiers
                .filter( verifier => verifier[0].toString() === verifierAddress)

   }

   async proposeVerifier(verifierAccount, datacap, multisigKey) {

        // Not address but account in the form "t01004", for instance
        let tx = methods.rootkey.propose(methods.verifreg.addVerifier(verifierAccount, datacap))
        await methods.sendTx(this.client, multisigKey, tx)

    }

    async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, multisigKey) {

        // Not address but account in the form "t01003", for instance
        let add = methods.verifreg.addVerifier(verifierAccount, datacap)
        console.log("here",add.params.toString("hex"))

        //let tx = methods.rootkey.approve(0, {...add, from: "t01001"})
        let tx = methods.rootkey.approve(transactionId, {...add, from: fromAccount})
        console.log(tx)
   
        await methods.sendTx(this.client, multisigKey, tx)

    }   

    
   async listVerifiedClients() {

        const head = await this.client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        const verified = (await this.client.chainGetNode(`${state}/@Ha:t06/1/2`)).Obj  
     
        return await hamt.buildArrayData(verified, this.load)      
      
    }

    async checkClient(clientAddress) {

        return this.listVerifiedClients
                   .filter( client => client[0].toString() === clientAddress)
    }


    async verifyClient(clientAddress, datacap, key) {

        let arg = methods.verifreg.addVerifiedClient(clientAddress, datacap)
        await methods.sendTx(this.client, key, arg)
    }


}

module.exports = VerifyAPI


/*

listVerifiers() return List(address, datacap), error
listClients() return List(address, datacap)
verifyClient(clientAddress, dataCap, verifierAddress, verifierKey) return bool, error
proposeVerifier(verifierAddress, fromAddress, fromKey) return bool, error
acceptVerifier(verifierAddress, fromAddress, fromKey) return bool, error
checkVerifier(verifierAddress) return (address, datacap), error


addVerifier(verifierAddress, fromAddress,  rootKey) return bool, error
removeVerifier(verifierAddress, fromAddress, rootKey) return bool, error


getVerifiers(rootKeyAddress) return List(address, datacap, date, Tx details), error
getVerifiedClients(verifierAddress) return List(address, datacap, date, Tx details), error
*/