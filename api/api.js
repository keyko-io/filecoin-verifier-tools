const {LotusRPC} = require('@filecoin-shipyard/lotus-client-rpc')
const {NodejsProvider: Provider} = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const {testnet} = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt')
// const CID = require('cids')
const fs = require('fs')
const address = require('@openworklabs/filecoin-address')
const methods = require('../methods')



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
    
   async listVerifiedClients() {

        const head = await this.client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        const verified = (await this.client.chainGetNode(`${state}/@Ha:t06/1/2`)).Obj  
     
        return await hamt.buildArrayData(verified, this.load)      
      
    }

    async verifyClient(address, datacap, key) {

        let arg = methods.verifreg.addVerifiedClient(address, datacap)
        await methods.sendTx(this.client, key, arg)
    }

}

module.exports = VerifyAPI


/*

listVerifiers() return List(address, datacap), error
listClients() return List(address, datacap)
verifyClient(clientAddress, dataCap, verifierAddress, verifierKey) return bool, error


addVerifier(verifierAddress, fromAddress,  rootKey) return bool, error
removeVerifier(verifierAddress, fromAddress, rootKey) return bool, error

proposeVerifier(verifierAddress, fromAddress, fromKey) return bool, error
acceptVerifier(verifierAddress, fromAddress, fromKey) return bool, error

getVerifiers(rootKeyAddress) return List(address, datacap, date, Tx details), error

checkVerifier(verifierAddress) return (address, datacap), error

getVerifiedClients(verifierAddress) return List(address, datacap, date, Tx details), error
*/