import VerifyAPI from './api'
import MockWallet from '../samples/mockWallet'
import { rootkey_mnemonic, path } from '../samples/constants'

let rkhWallet
let rkhApi

describe('should test the api', () => {
  it('initialize api', async () => {
    rkhWallet = new MockWallet(rootkey_mnemonic, path)
    rkhApi = new VerifyAPI( // eslint-disable-line
      VerifyAPI.standAloneProvider('https://lotus.filecoin.nevermined.rocks/rpc/v0'
        , {
          token: async () => {
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'
          },
        })
      , rkhWallet,
    )

    const verifiers = await rkhApi.listVerifiers()
    expect(verifiers).toBeTruthy()
  })

  it('test checkWallet', async () => {
    const w = await rkhApi.checkWallet(rkhWallet)
    expect(w).toBeTruthy()
  })
  it('test proposeVerifier & approveVerifier', async () => {
    const propose = await rkhApi.proposeVerifier('t01015', 100000000000000000000000000000000000000000n, 2)
    expect(propose).toBeTruthy()
    // TODO test approveVerifier
  })
  //   it("test proposeRemoveVerifier", async ()=> {

  //   })
  //   it("test send", async ()=> {
  // No need
  //   })
  //   it("test getReceipt", async ()=> {

  //   })
  //   it("test getMessage", async ()=> {

  //   })
  //   it("test stateWaitMessage", async ()=> {

  //   })

  //   it("test removeVerifier", async ()=> {

  //   })
  //   it("test cancelVerifier", async ()=> {

  //   })
  //   it("test listVerifiedClients", async ()=> {

  //   })
  //   it("test listRootkeys", async ()=> {

  //   })
  //   it("test listSigners", async ()=> {

  //   })
  //   it("test actorType", async ()=> {

  //   })
  //   it("test cachedActorAddress", async ()=> {

  //   })
  //   it("test actorAddress", async ()=> {

  //   })
  //   it("test cachedActorKey", async ()=> {

  //   })
  //   it("test actorKey", async ()=> {

  //   })
  //   it("test checkClient", async ()=> {

  //   })
  //   it("test checkVerifier", async ()=> {

  //   })
  //   it("test verifyClient", async ()=> {

  //   })
  //   it("test multisigVerifyClient", async ()=> {

  //   })
  //   it("test approvePending", async ()=> {

  //   })
  //   it("test cancelPending", async ()=> {

  //   })
  //   it("test getTxFromMsgCid", async ()=> {

  //   })
  //   it("test multisigProposeClient", async ()=> {

  //   })
  //   it("test newMultisig", async ()=> {

  //   })
  //   it("test multisigAdd", async ()=> {

  //   })
  //   it("test pendingRootTransactions", async ()=> {

  //   })
  //   it("test multisigInfo", async ()=> {

  //   })
  //   it("test pendingTransactions", async ()=> {

  //   })
  //   it("test signAndPushCustomTransaction", async ()=> {

  //   })
  //   it("test listMessagesFromToAddress", async ()=> {

  //   })
  //   it("test mpoolPush", async ()=> {

  //   })
})
