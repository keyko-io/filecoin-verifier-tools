const { mainnet } = require('@filecoin-shipyard/lotus-client-schema')
const methods = require('../filecoin/methods')
const { BrowserProvider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const cbor = require('cbor')

const cacheAddress = {}
const cacheKey = {}

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

  async getPath(addr, path) {
    const head = await this.client.chainHead()
    const actor = await this.client.stateGetActor(addr, head.Cids)
    // const state = head.Blocks[0].ParentStateRoot['/']
    // return (await this.client.chainGetNode(`${state}/1/@Ha:${addr}/${path}`)).Obj
    return (await this.client.chainGetNode(`${actor.Head['/']}/${path}`)).Obj
  }

  async listVerifiers() {
    const verifiers = await this.getPath(this.methods.VERIFREG, '1')
    const listOfVerifiers = await this.methods.buildArrayData(verifiers, a => this.load(a))
    const returnList = []
    for (const [key, value] of listOfVerifiers) {
      returnList.push({
        verifier: key,
        datacap: value.toString(10),
      })
    }
    return returnList
  }

  checkWallet(wallet) {
    if (!wallet && !this.walletContext) { throw new Error('No wallet context defined in API') }
    return wallet || this.walletContext
  }

  async proposeVerifier(verifierAccount, datacap, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01004", for instance
    const tx = this.methods.rootkey.propose(this.methods.verifreg.addVerifier(verifierAccount, datacap))
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas })
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async proposeRemoveVerifier(verifierAccount, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01004", for instance
    const tx = this.methods.rootkey.propose(this.methods.verifreg.removeVerifier(verifierAccount))
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas })
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async send(tx, indexAccount, wallet, { gas } = { gas: 0 }) {
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas })
    return res['/']
  }

  async getReceipt(id) {
    return this.methods.getReceipt(this.client, id)
  }

  async getMessage(cid) {
    return this.methods.getMessage(this.client, cid)
  }

  async stateWaitMessage(cid) {
    return this.methods.stateWaitMsg(this.client, cid)
  }

  async approveVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01003", for instance
    const add = this.methods.verifreg.addVerifier(verifierAccount, datacap)
    const tx = this.methods.rootkey.approve(parseInt(transactionId, 10), { ...add, from: fromAccount })
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas })
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async removeVerifier(verifierAccount, fromAccount, transactionId, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01003", for instance
    const remove = this.methods.verifreg.removeVerifier(verifierAccount)
    const tx = this.methods.rootkey.approve(parseInt(transactionId, 10), { ...remove, from: fromAccount })
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas })
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async cancelVerifier(verifierAccount, datacap, fromAccount, transactionId, indexAccount, wallet, { gas } = { gas: 0 }) {
    // Not address but account in the form "t01003", for instance
    const add = this.methods.verifreg.addVerifier(verifierAccount, datacap)
    const tx = this.methods.rootkey.cancel(parseInt(transactionId, 10), { ...add, from: fromAccount })
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...tx, gas })
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async listVerifiedClients() {
    const verified = await this.getPath(this.methods.VERIFREG, '2')
    const listOfVerified = await this.methods.buildArrayData(verified, a => this.load(a))
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
    return this.listSigners(this.methods.ROOTKEY)
  }

  async listSigners(addr) {
    const data = await this.getPath(addr, '')
    const info = this.methods.decode(this.methods.msig_state, data)
    return info.signers
  }

  async actorType(addr) {
    const head = await this.client.chainHead()
    const actor = await this.client.stateGetActor(addr, head.Cids)
    return actor.Code['/']
  }

  async cachedActorAddress(str) {
    if (cacheAddress[str]) {
      return cacheAddress[str]
    }
    try {
      const head = await this.client.chainHead()
      const ret = await this.client.stateLookupID(str, head.Cids)
      cacheAddress[str] = ret
      return ret
    } catch (err) {
      return str
    }
  }

  async cachedActorKey(str) {
    if (cacheKey[str]) {
      return cacheKey[str]
    }
    try {
      const head = await this.client.chainHead()
      cacheKey[str] = await this.client.stateAccountKey(str, head.Cids)
      return cacheKey[str]
    } catch (err) {
      return str
    }
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
      return str
    }
  }

  async checkClient(verified) {
    try {
      const data = await this.getPath(this.methods.VERIFREG, '')
      const info = this.methods.decode(this.methods.verifreg_state, data)
      const clients = await info.clients(a => this.load(a))
      const datacap = await clients.find(a => this.load(a), verified)
      return [{ verified, datacap }]
    } catch (err) {
      return []
    }
  }

  async checkVerifier(verifier) {
    try {
      const data = await this.getPath(this.methods.VERIFREG, '')
      const info = this.methods.decode(this.methods.verifreg_state, data)
      const verifiers = await info.verifiers(a => this.load(a))
      const datacap = await verifiers.find(a => this.load(a), verifier)
      return [{ verifier, datacap }]
    } catch (err) {
      return []
    }
  }

  async verifyClient(clientAddress, datacap, indexAccount, wallet, { gas } = { gas: 0 }) {
    const arg = this.methods.verifreg.addVerifiedClient(clientAddress, datacap)
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...arg, gas })
    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async multisigVerifyClient(multisigAddress, clientAddress, datacap, indexAccount, wallet, { gas } = { gas: 0 }) {
    const tx = this.methods.verifreg.addVerifiedClient(clientAddress, datacap)
    const m_actor = this.methods.actor(multisigAddress, this.methods.multisig)

    const proposeTx = m_actor.propose(tx)
    const res = await this.methods.sendTx(this.client, indexAccount, this.checkWallet(wallet), { ...proposeTx, gas })

    // res has this shape: {/: "bafy2bzaceb32fwcf7uatfxfs367f3tw5yejcresnw4futiz35heb57ybaqxvu"}
    // we return the messageID
    return res['/']
  }

  async approvePending(msig, tx, from, wallet) {
    const m1_actor = this.methods.actor(msig, this.methods.multisig)
    const messageId = await this.send(m1_actor.approve(parseInt(tx.id), tx.tx), from, wallet)
    return messageId
  }

  async cancelPending(msig, tx, from, wallet) {
    const m1_actor = this.methods.actor(msig, this.methods.multisig)
    await this.send(m1_actor.cancel(parseInt(tx.id), tx.tx), from, wallet)
  }

  async getTxFromMsgCid(cid) {
    try {
      const waitMsg = await this.stateWaitMessage(cid)
      const txId = waitMsg.ReturnDec.TxnID

      const getMessage = await this.getMessage(cid)
      const to = getMessage.To

      const pendingTxs = await this.pendingTransactions(to)
      const tx = pendingTxs.find(tx => { tx.id = txId })

      if (!tx) return null
      return tx
    } catch (error) {
      console.log(error)
    }
  }

  async multisigProposeClient(m0_addr, m1_addr, client, cap, from, wallet) {
    const amount = cap * 1073741824n // 1 GiB
    const m0_actor = this.methods.actor(m0_addr, this.methods.multisig)
    const m1_actor = this.methods.actor(m1_addr, this.methods.multisig)
    const tx = this.methods.verifreg.addVerifiedClient(client, amount)
    const tx2 = m0_actor.propose(tx)
    return await this.send(m1_actor.propose(tx2), from, wallet)
  }

  async newMultisig(signers, threshold, cap, from, wallet) {
    const tx = this.methods.init.exec(this.methods.multisigCID, this.methods.encode(this.methods.msig_constructor, [signers, threshold, cap, 1000]))
    const txid = await this.send({ ...tx, value: cap }, from, wallet)
    const receipt = await this.getReceipt(txid)
    const [addr] = this.methods.decode(['list', 'address'], cbor.decode(Buffer.from(receipt.Return, 'base64')))
    return addr
  }

  async multisigAdd(addr, signer, from, wallet) {
    const actor = this.methods.actor(addr, this.methods.multisig)
    const tx = actor.propose(actor.addSigner(signer, false))
    const txid = await this.send(tx, from, wallet)
    return this.getReceipt(txid)
  }

  async pendingRootTransactions() {
    return this.pendingTransactions(this.methods.ROOTKEY)
  }

  async multisigInfo(addr) {
    const data = await this.getPath(addr, '')
    return this.methods.decode(this.methods.msig_state, data)
  }

  async pendingTransactions(addr) {
    const data = await this.getPath(addr, '6')
    const info = this.methods.decode(this.methods.pending, data)
    const obj = await info.asObject(a => this.load(a))
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

  async signAndPushCustomTransaction(from, to, params) {
    try {
      const nonce = await this.client.mpoolGetNonce(from)

      const msg = {
        // version: 42,
        to,
        from,
        nonce,
        value: '0',
        gaslimit: 208863,
        gasfeecap: '100000000',
        gaspremium: '0',
        method: 1,
        params,
      }
      const walletSignMessage = await this.client.walletSignMessage(from, msg)
      const pushedMsgId = await this.client.mpoolPush(walletSignMessage)
      return { success: true, walletSignMessage, pushedMsgId }
    } catch (error) {
      return { success: false, error }
    }
  }

  async listMessagesFromToAddress(From, To, heightPerc = 0.5) {
    try {
      const head = await this.client.chainHead()
      const messages = await this.client.stateListMessages(
        {
          To,
          From,
        },
        head.Cids,
        Math.round(head.Height - head.Height * heightPerc),
      )
      return messages ? { success: true, messages } : { success: false }
    } catch (error) {
      return { success: false, error }
    }
  }

  async mpoolPush(walletSignMessage) {
    try {
      const pushedMsgId = await this.client.mpoolPush(walletSignMessage)
      return pushedMsgId
    } catch (error) {
      return false
    }
  }
}

module.exports = VerifyAPI
