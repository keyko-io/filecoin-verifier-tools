const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt/hamt')
const methods = require('../filecoin/methods')
const { BrowserProvider: BrowserProvider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { NodejsProvider: NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')

class VerifyAPI {

    constructor(lotusClient, walletContext) {
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
        try {
            let res = await this.client.chainGetNode(a)
            return res.Obj
        } catch (err) {
            throw err
        }
    }

    async listVerifiers() {
        try{
            const head = await this.client.chainHead()
            const state = head.Blocks[0].ParentStateRoot['/']
            const verifiers = (await this.client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
            const listOfVerifiers = await hamt.buildArrayData(verifiers, this.load)
            let returnList = []
            for(const [key,value] of listOfVerifiers){
                returnList.push({
                    verifier: key,
                    datacap: value.toString(10)
                })
            }
            return returnList
        } catch (err) {
            throw err
        }
      
   }


    async checkVerifier(verifierAddress) {

        try {
            // empty array if not verifier is present
            return this.listVerifiers
                .filter(verifier => verifier[0].toString() === verifierAddress)
        } catch (err) {
            throw err
        }

    }

    async proposeVerifier(verifierAccount, datacap, indexAccount) {

        if (typeof this.walletContext === 'undefined' || !this.walletContext)
            throw new Error("No wallet context defined in API")

        try {
            // Not address but account in the form "t01004", for instance
            let tx = methods.rootkey.propose(methods.verifreg.addVerifier(verifierAccount, datacap))
            let res = await methods.sendTx(this.client, indexAccount, this.walletContext, tx)
            // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
            // we return the messageID
            return res['/']
        } catch (err) {
            throw err
        }

    }

    async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount) {

        if (typeof this.walletContext === 'undefined' || !this.walletContext)
            throw new Error("No wallet context defined in API")

        try {
            // Not address but account in the form "t01003", for instance
            let add = methods.verifreg.addVerifier(verifierAccount, datacap)

            //let tx = methods.rootkey.approve(0, {...add, from: "t01001"})
            let tx = methods.rootkey.approve(parseInt(transactionId, 10), {...add, from: fromAccount})
            console.log(tx)
   
            let res = await methods.sendTx(this.client, indexAccount, this.walletContext, tx)
            // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
            // we return the messageID
            return res['/']
        } catch (err) {
            throw err
        }

    }

    async listVerifiedClients() {

        try {
            const head = await this.client.chainHead()
            const state = head.Blocks[0].ParentStateRoot['/']
            const verified = (await this.client.chainGetNode(`${state}/@Ha:t06/1/2`)).Obj  
            const listOfVerified = await hamt.buildArrayData(verified, this.load)
            let returnList = []
            for(const [key,value] of listOfVerified){
                returnList.push({
                    verified: key,
                    datacap: value.toString(10)
                })
            }
            return returnList
        }catch (err) {
            throw err
        }
    }

    async checkClient(clientAddress) {
        try {
            return this.listVerifiedClients
                .filter(client => client[0].toString() === clientAddress)
        } catch (err) {
            throw err
        }
    }

    async pendingRootTransactions() {
        const head = await this.client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        const data = (await this.client.chainGetNode(`${state}/@Ha:t080/1/6`)).Obj
        let info = methods.decode(methods.pending, data)
        let obj = await info.asObject(this.load)
        for (let [k,v] of Object.entries(obj)) {
            obj[k].parsed = methods.parse(v)
        }
        return obj
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
        } catch (err) {
            throw err
        }
    }

    async pendingRootTransactions() {
        const head = await this.client.chainHead()
        const state = head.Blocks[0].ParentStateRoot['/']
        const data = (await this.client.chainGetNode(`${state}/@Ha:t080/1/6`)).Obj
        let info = methods.decode(methods.pending, data)
        let obj = await info.asObject(this.load)
        let returnList = []
        for (let [k,v] of Object.entries(obj)) {
            const parsed = methods.parse(v)
            returnList.push({
                id: k,
                type: parsed.params.cap.toString() === '0' ? 'Revoke' : 'Add',
                verifier: parsed.params.verifier,
                datacap: parsed.params.cap.toString(),
                singers: v.singers
            })
        }
        return returnList
    }

}

module.exports = VerifyAPI
