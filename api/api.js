<<<<<<< HEAD
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
=======
const { mainnet } = require('@filecoin-shipyard/lotus-client-schema')
const hamt = require('../hamt/hamt')
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
const methods = require('../filecoin/methods')
const { BrowserProvider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const cbor = require('cbor')

class VerifyAPI {
  constructor(lotusClient, walletContext, testnet = true) {
    this.methods = testnet ? methods.testnet : methods.mainnet
    this.client = lotusClient
    this.walletContext = walletContext
  }

  static standAloneProvider(lotusEndpoint, token) {
    var provider = new NodejsProvider(lotusEndpoint, token)
    return new LotusRPC(provider, { schema: mainnet.fullNode })
  }

  static browserProvider(lotusEndpoint, token) {
    var provider = new BrowserProvider(lotusEndpoint, token)
    return new LotusRPC(provider, { schema: mainnet.fullNode })
  }

  async load(a) {
    const res = await this.client.chainGetNode(a)
    return res.Obj
  }

  async listVerifiers() {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
<<<<<<< HEAD
    const verifiers = (await this.client.chainGetNode(`${state}/@Ha:t06/1/1`)).Obj
    const listOfVerifiers = await this.methods.buildArrayData(verifiers, this.load)
=======
    const verifiers = (await this.client.chainGetNode(`${state}/1/@Ha:t06/1/1`)).Obj
    const listOfVerifiers = await hamt.buildArrayData(verifiers, this.load)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
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

  checkWallet(wallet) {
    if (!wallet && !this.walletContext) { throw new Error('No wallet context defined in API') }
    return wallet || this.walletContext
  }

  async proposeVerifier(verifierAccount, datacap, indexAccount, wallet) {
    // Not address but account in the form "t01004", for instance
<<<<<<< HEAD
    const tx = this.methods.rootkey.propose(this.methods.verifreg.addVerifier(verifierAccount, datacap))
    const res = await this.methods.sendTx(this.client, indexAccount, this.walletContext, tx)
=======
    const tx = methods.rootkey.propose(methods.verifreg.addVerifier(verifierAccount, datacap))
    const res = await methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), tx)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

<<<<<<< HEAD
  async send(tx, indexAccount) {
    if (typeof this.walletContext === 'undefined' || !this.walletContext) { throw new Error('No wallet context defined in API') }
    const res = await this.methods.sendTx(this.client, indexAccount, this.walletContext, tx)
=======
  async send(tx, indexAccount, wallet) {
    const res = await methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), tx)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    return res['/']
  }

  async getReceipt(id) {
    return this.methods.getReceipt(this.client, id)
  }

  async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount, wallet) {
    // Not address but account in the form "t01003", for instance
    const add = this.methods.verifreg.addVerifier(verifierAccount, datacap)

    // let tx = this.methods.rootkey.approve(0, {...add, from: "t01001"})
    const tx = this.methods.rootkey.approve(parseInt(transactionId, 10), { ...add, from: fromAccount })
    console.log(tx)

<<<<<<< HEAD
    const res = await this.methods.sendTx(this.client, indexAccount, this.walletContext, tx)
=======
    const res = await methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), tx)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async listVerifiedClients() {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
<<<<<<< HEAD
    const verified = (await this.client.chainGetNode(`${state}/@Ha:t06/1/2`)).Obj
    const listOfVerified = await this.methods.buildArrayData(verified, this.load)
=======
    const verified = (await this.client.chainGetNode(`${state}/1/@Ha:t06/1/2`)).Obj
    const listOfVerified = await hamt.buildArrayData(verified, this.load)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
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
<<<<<<< HEAD
    const data = (await this.client.chainGetNode(`${state}/@Ha:t080/1`)).Obj
    const info = this.methods.decode(this.methods.msig_state, data)
=======
    const data = (await this.client.chainGetNode(`${state}/1/@Ha:t080/1`)).Obj
    const info = methods.decode(methods.msig_state, data)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    return info.signers
  }

  async listSigners(addr) {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
<<<<<<< HEAD
    const data = (await this.client.chainGetNode(`${state}/@Ha:${addr}/1`)).Obj
    const info = this.methods.decode(this.methods.msig_state, data)
=======
    const data = (await this.client.chainGetNode(`${state}/1/@Ha:${addr}/1`)).Obj
    const info = methods.decode(methods.msig_state, data)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    return info.signers
  }

  async actorType(addr) {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
    const data = (await this.client.chainGetNode(`${state}/1/@Ha:${addr}/0`)).Obj
    return data
  }

  async actorAddress(str) {
    const head = await this.client.chainHead()
    return this.client.stateLookupID(str, head.Cids)
  }

  async actorKey(str) {
    try {
      const head = await this.client.chainHead()
      const res = await this.client.stateAccountKey(str, head.Cids)
      return res
    } catch (err) {
      console.log('Cannot convert to key', err)
      return str
    }
  }

  async checkClient(clientAddress) {
    return this.listVerifiedClients
      .filter(client => client[0].toString() === clientAddress)
  }

<<<<<<< HEAD
  async verifyClient(clientAddress, datacap, indexAccount) {
    if (typeof this.walletContext === 'undefined' || !this.walletContext) { throw new Error('No wallet context defined in API') }
    const arg = this.methods.verifreg.addVerifiedClient(clientAddress, datacap)
    const res = await this.methods.sendTx(this.client, indexAccount, this.walletContext, arg)
=======
  async verifyClient(clientAddress, datacap, indexAccount, wallet) {
    const arg = methods.verifreg.addVerifiedClient(clientAddress, datacap)
    const res = await methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), arg)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

<<<<<<< HEAD
  async approvePending(msig, tx, from) {
    const m1_actor = this.methods.actor(msig, this.methods.multisig)
    await this.send(m1_actor.approve(parseInt(tx.id), tx.tx), from)
=======
  async approvePending(msig, tx, from, wallet) {
    const m1_actor = methods.actor(msig, methods.multisig)
    await this.send(m1_actor.approve(parseInt(tx.id), tx.tx), from, wallet)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
  }

  async multisigProposeClient(m0_addr, m1_addr, client, cap, from, wallet) {
    const amount = cap * 1000000000n
<<<<<<< HEAD
    const m0_actor = this.methods.actor(m0_addr, this.methods.multisig)
    const m1_actor = this.methods.actor(m1_addr, this.methods.multisig)
    const tx = this.methods.verifreg.addVerifiedClient(client, amount)
    const tx2 = { ...m0_actor.propose(tx), value: cap }
    return await this.send(m1_actor.propose(tx2), from)
  }

  async newMultisig(signers, threshold, cap, from) {
    const tx = this.methods.init.exec(this.methods.multisigCID, this.methods.encode(this.methods.msig_constructor, [signers, threshold, cap]))
    const txid = await this.send({ ...tx, value: cap }, from)
=======
    const m0_actor = methods.actor(m0_addr, methods.multisig)
    const m1_actor = methods.actor(m1_addr, methods.multisig)
    const tx = methods.verifreg.addVerifiedClient(client, amount)
    const tx2 = m0_actor.propose(tx)
    return await this.send(m1_actor.propose(tx2), from, wallet)
  }

  async newMultisig(signers, threshold, cap, from, wallet) {
    const tx = methods.init.exec(methods.multisigCID, methods.encode(methods.msig_constructor, [signers, threshold, cap, 1000]))
    const txid = await this.send({ ...tx, value: cap }, from, wallet)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    const receipt = await this.getReceipt(txid)
    const [addr] = this.methods.decode(['list', 'address'], cbor.decode(Buffer.from(receipt.Return, 'base64')))
    return addr
  }

<<<<<<< HEAD
  async multisigAdd(addr, signer, from) {
    const actor = this.methods.actor(addr, this.methods.multisig)
=======
  async multisigAdd(addr, signer, from, wallet) {
    const actor = methods.actor(addr, methods.multisig)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    const tx = actor.propose(actor.addSigner(signer, false))
    const txid = await this.send(tx, from, wallet)
    return this.getReceipt(txid)
  }

  async pendingRootTransactions() {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
<<<<<<< HEAD
    const data = (await this.client.chainGetNode(`${state}/@Ha:t080/1/6`)).Obj
    const info = this.methods.decode(this.methods.pending, data)
=======
    const data = (await this.client.chainGetNode(`${state}/1/@Ha:t080/1/6`)).Obj
    const info = methods.decode(methods.pending, data)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    const obj = await info.asObject(this.load)
    const returnList = []
    for (const [k, v] of Object.entries(obj)) {
      const parsed = this.methods.parse(v)
      returnList.push({
        id: k,
        tx: { ...v, from: v.signers[0] },
        parsed,
        signers: v.signers,
      })
    }
    return returnList
  }

  async multisigInfo(addr) {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
<<<<<<< HEAD
    const data = (await this.client.chainGetNode(`${state}/@Ha:${addr}/1`)).Obj
    return this.methods.decode(this.methods.msig_state, data)
=======
    const data = (await this.client.chainGetNode(`${state}/1/@Ha:${addr}/1`)).Obj
    return methods.decode(methods.msig_state, data)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
  }

  async pendingTransactions(addr) {
    const head = await this.client.chainHead()
    const state = head.Blocks[0].ParentStateRoot['/']
<<<<<<< HEAD
    const data = (await this.client.chainGetNode(`${state}/@Ha:${addr}/1/6`)).Obj
    const info = this.methods.decode(this.methods.pending, data)
=======
    const data = (await this.client.chainGetNode(`${state}/1/@Ha:${addr}/1/6`)).Obj
    const info = methods.decode(methods.pending, data)
>>>>>>> fc961f9aefff797d5fda3263383ec3a6d2787837
    const obj = await info.asObject(this.load)
    const returnList = []
    for (const [k, v] of Object.entries(obj)) {
      const parsed = this.methods.parse(v)
      returnList.push({
        id: parseInt(k),
        tx: { ...v, from: v.signers[0] },
        parsed,
        signers: v.signers,
      })
    }
    return returnList
  }
}

module.exports = VerifyAPI
