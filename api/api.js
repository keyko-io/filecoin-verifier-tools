const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt/hamt')
const methods = require('../filecoin/methods')
const { BrowserProvider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
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
    const res = await this.client.chainGetNode(a)
    return res.Obj
  }

  async listVerifiers() {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
    const verifiers = (await this.client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
    const listOfVerifiers = await hamt.buildArrayData(verifiers, this.load)
    const returnList = []
    for (const [key, value] of listOfVerifiers) {
      returnList.push({
        verifier: key,
        datacap: value.toString(10),
      })
    }
    return returnList
  }

  async checkVerifier(verifierAddress) {
    // empty array if not verifier is present
    const lst = await this.listVerifiers()
    return lst.filter(({ verifier }) => verifier.toString() === verifierAddress)
  }

  async proposeVerifier(verifierAccount, datacap, indexAccount) {
    if (typeof this.walletContext === 'undefined' || !this.walletContext) { throw new Error('No wallet context defined in API') }

    // Not address but account in the form "t01004", for instance
    const tx = methods.rootkey.propose(methods.verifreg.addVerifier(verifierAccount, datacap))
    const res = await methods.sendTx(this.client, indexAccount, this.walletContext, tx)
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async send(tx, indexAccount) {
    if (typeof this.walletContext === 'undefined' || !this.walletContext) { throw new Error('No wallet context defined in API') }
    const res = await methods.sendTx(this.client, indexAccount, this.walletContext, tx)
    return res['/']
  }

  async getReceipt(id) {
    return methods.getReceipt(this.client, id)
  }

  async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount) {
    if (typeof this.walletContext === 'undefined' || !this.walletContext) { throw new Error('No wallet context defined in API') }

    // Not address but account in the form "t01003", for instance
    const add = methods.verifreg.addVerifier(verifierAccount, datacap)

    // let tx = methods.rootkey.approve(0, {...add, from: "t01001"})
    const tx = methods.rootkey.approve(parseInt(transactionId, 10), { ...add, from: fromAccount })
    console.log(tx)

    const res = await methods.sendTx(this.client, indexAccount, this.walletContext, tx)
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async listVerifiedClients() {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
    const verified = (await this.client.chainGetNode(`${state}/@Ha:t06/1/2`)).Obj
    const listOfVerified = await hamt.buildArrayData(verified, this.load)
    const returnList = []
    for (const [key, value] of listOfVerified) {
      returnList.push({
        verified: key,
        datacap: value.toString(10),
      })
    }
    return returnList
  }

  async listRootkeys() {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
    const data = (await this.client.chainGetNode(`${state}/@Ha:t080/1`)).Obj
    const info = methods.decode(methods.msig_state, data)
    return info.signers
  }

  async actorAddress(str) {
    const head = await this.client.chainHead()
    return this.client.stateLookupID(str, head.Cids)
  }

  async actorKey(str) {
    const head = await this.client.chainHead()
    return this.client.stateAccountKey(str, head.Cids)
  }

  async checkClient(clientAddress) {
    return this.listVerifiedClients
      .filter(client => client[0].toString() === clientAddress)
  }

  async verifyClient(clientAddress, datacap, indexAccount) {
    if (typeof this.walletContext === 'undefined' || !this.walletContext) { throw new Error('No wallet context defined in API') }
    const arg = methods.verifreg.addVerifiedClient(clientAddress, datacap)
    const res = await methods.sendTx(this.client, indexAccount, this.walletContext, arg)
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async pendingRootTransactions() {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
    const data = (await this.client.chainGetNode(`${state}/@Ha:t080/1/6`)).Obj
    const info = methods.decode(methods.pending, data)
    const obj = await info.asObject(this.load)
    const returnList = []
    for (const [k, v] of Object.entries(obj)) {
      const parsed = methods.parse(v)
      returnList.push({
        id: k,
        tx: { ...v, from: v.signers[0] },
        parsed,
        signers: v.signers,
      })
    }
    return returnList
  }
}

module.exports = VerifyAPI
