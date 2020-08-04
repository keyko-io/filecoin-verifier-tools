const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt/hamt')
// const CID = require('cids')
const fs = require('fs')
const address = require('@openworklabs/filecoin-address')
const methods = require('../filecoin/methodsWallet')
const { BrowserProvider: BrowserProvider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { NodejsProvider: NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')

class VerifyAPIWithWallet {

    constructor (lotusClient, walletContext) {
        this.client = lotusClient
        this.walletContext = walletContext
    }

    static standAloneProvider(lotusEndpoint, token) {
        var provider = new NodejsProvider(lotusEndpoint, token)
        return new LotusRPC(provider, { schema: testnet.fullNode })
    }

    static browserProvider(lotusEndpoint, token) {
        var provider = new BrowserProvider(lotusEndpoint, token)
        return new LotusRPC(provider, { schema: testnet.fullNode })
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

   async proposeVerifier(verifierAccount, datacap, indexAccount) {

   
        // Not address but account in the form "t01004", for instance
       let tx = methods.rootkey.propose(methods.verifreg.addVerifier(verifierAccount, datacap))
    await methods.sendTx(this.client, indexAccount, this.walletContext, tx)

    }

     async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount) {

        // Not address but account in the form "t01003", for instance
        let add = methods.verifreg.addVerifier(verifierAccount, datacap)
        console.log("here",add.params.toString("hex"))

        //let tx = methods.rootkey.approve(0, {...add, from: "t01001"})
        let tx = methods.rootkey.approve(transactionId, {...add, from: fromAccount})
        console.log(tx)
   
        await methods.sendTx(this.client, indexAccount, this.walletContext, tx)

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


    async verifyClient(clientAddress, datacap, indexAccount) {

        let arg = methods.verifreg.addVerifiedClient(clientAddress, datacap)
        await methods.sendTx(this.client, indexAccount, this.walletContext, arg)
    }


}

module.exports = VerifyAPIWithWallet