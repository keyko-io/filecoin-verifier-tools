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
        try{
            let res = await this.client.chainGetNode(a)
            return res.Obj
        }catch (err) {
            throw err
          }
    }

    async listVerifiers() {

        try{
            const head = await this.client.chainHead()
            const state = head.Blocks[0].ParentStateRoot['/']
            const verifiers = (await this.client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
        
            return  await hamt.buildArrayData(verifiers, this.load)
        }catch (err) {
            throw err
          }
      
   }

   async checkVerifier(verifierAddress) {

    try{
        // empty array if not verifier is present
        return this.listVerifiers
                    .filter( verifier => verifier[0].toString() === verifierAddress)
    }catch (err) {
        throw err
      }

   }

   async proposeVerifier(verifierAccount, datacap, indexAccount) {

    if ( typeof this.walletContext === 'undefined' || !this.walletContext)
        throw new Error("No wallet context defined in API")

        try{
            // Not address but account in the form "t01004", for instance
            let tx = methods.rootkey.propose(methods.verifreg.addVerifier(verifierAccount, datacap))
            let res = await methods.sendTx(this.client, indexAccount, this.walletContext, tx)
            // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
            // we return the messageID
            return res['/']
        }catch (err) {
            throw err
          }

    }

     async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount) {

        if ( typeof this.walletContext === 'undefined' || !this.walletContext)
            throw new Error("No wallet context defined in API")
        
        try{
            // Not address but account in the form "t01003", for instance
            let add = methods.verifreg.addVerifier(verifierAccount, datacap)
            console.log("here",add.params.toString("hex"))

            //let tx = methods.rootkey.approve(0, {...add, from: "t01001"})
            let tx = methods.rootkey.approve(transactionId, {...add, from: fromAccount})
            console.log(tx)
   
            let res = await methods.sendTx(this.client, indexAccount, this.walletContext, tx)
            // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
            // we return the messageID
            return res['/']
        }catch (err) {
            throw err
          }

    }   


   async listVerifiedClients() {

        try{
            const head = await this.client.chainHead()
            const state = head.Blocks[0].ParentStateRoot['/']
            const verified = (await this.client.chainGetNode(`${state}/@Ha:t06/1/2`)).Obj  
            
            return await hamt.buildArrayData(verified, this.load)     
        }catch (err) {
            throw err
          }
    } 
      

    async checkClient(clientAddress) {

        try {
            return this.listVerifiedClients
                        .filter( client => client[0].toString() === clientAddress)
        }catch (err) {
            throw err
        }   
    }


    async verifyClient(clientAddress, datacap, indexAccount) {

        
        if ( typeof this.walletContext === 'undefined' || !this.walletContext)
            throw new Error("No wallet context defined in API")

        try{ 
            let arg = methods.verifreg.addVerifiedClient(clientAddress, datacap)
            let res = await methods.sendTx(this.client, indexAccount, this.walletContext, arg)
            // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
            // we return the messageID
            return res['/']
        }catch (err) {
            throw err
          }
    }


}

module.exports = VerifyAPIWithWallet