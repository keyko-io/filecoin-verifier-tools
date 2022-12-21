import VerifyAPI from "./api"
import MockWallet from "../samples/mockWallet"
import {verifier_mnemonic, path} from "../samples/constants"

let mockWallet
let api

describe("should test the api", () => {
  it("initialize api", async () => {
     mockWallet = new MockWallet(verifier_mnemonic, path)
     api = new VerifyAPI( // eslint-disable-line
      VerifyAPI.standAloneProvider('https://lotus.filecoin.nevermined.rocks/rpc/v0'
        , {
          token: async () => {
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'
          },
        })
      , mockWallet
    )

    const verifiers = await api.listVerifiers()
    expect(verifiers).toBeTruthy()
  })

  // it("test load", async ()=> {

  // })
  // it("test getPath", async ()=> {

  // })
  it("test checkWallet", async ()=> {
      const w = await api.checkWallet(mockWallet)
      expect(w).toBeTruthy()
  })
//   it("test proposeVerifier", async ()=> {

//   })
//   it("test proposeRemoveVerifier", async ()=> {

//   })
//   it("test send", async ()=> {

//   })
//   it("test getReceipt", async ()=> {

//   })
//   it("test getMessage", async ()=> {

//   })
//   it("test stateWaitMessage", async ()=> {

//   })
//   it("test approveVerifier", async ()=> {

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