//@ts-nocheck
import { VerifyAPI } from './api'
import MockWallet from '../samples/mockWallet'
import { rootkey_mnemonic, verifier_mnemonic, path } from '../samples/constants'

let rkhWallet
let rkhApi
let verifierApi
let verifierWallet

function compareStringToBytesArray(string, compareArray) {
  const pairs = string.match(/.{1,2}/g)
  // console.log(pairs)

  const byteArray = []
  for (let i = 0; i < pairs.length; i++) {
    const byte = parseInt(pairs[i], 16)
    byteArray.push(byte)
  }

  // console.log(byteArray);
  // console.log(compareArray);
  const hasSameLength = byteArray.length === compareArray.length
  const everyValueIsSame = byteArray.every((elem, i) => elem === compareArray[i])

  return hasSameLength && everyValueIsSame
}

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
    verifierWallet = new MockWallet(verifier_mnemonic, path)
    verifierApi = new VerifyAPI( // eslint-disable-line
      VerifyAPI.standAloneProvider('https://lotus.filecoin.nevermined.rocks/rpc/v0'
        , {
          token: async () => {
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.wpOIystriKCXuvbxQnMnYP8tNxgi3Uwn3yeBpeiZJtw'
          },
        })
      , verifierWallet,
    )

    const verifiers = await rkhApi.listVerifiers()
    expect(verifiers).toBeTruthy()
  })

  it('test checkWallet rkh ', async () => {
    const w = await rkhApi.checkWallet(rkhWallet)
    expect(w).toBeTruthy()
  })
  it('test checkWallet verifier', async () => {
    const w = await verifierApi.checkWallet(verifierWallet)
    expect(w).toBeTruthy()
  })

  // it('test proposeVerifier & approveVerifier', async () => {
  //   const propose = await rkhApi.proposeVerifier('t01015', 100000000000000000000000000000000000000000n, 2)
  //   expect(propose).toBeTruthy()
  //   // TODO test approveVerifier
  // })

  it('should check the class and chainHead propoerty sohuld not be null', async () => {
    await rkhApi.getChainHead()
    expect(rkhApi.chainHead).not.toBeNull()
  })



  it("test encodeRemoveDataCapParameters", async () => {

    const bytes_array_to_compare = [102, 105, 108, 95, 114, 101, 109, 111, 118, 101, 100, 97, 116, 97, 99, 97, 112, 58, 131, 66, 0, 102, 70, 0, 8, 0, 0, 0, 0, 129, 0]

    const hexStringToCompare = '66696c5f72656d6f7665646174616361703a83420066460008000000008100'

    const params = { verifiedClient: 't0102', dataCapAmount: 34359738368, removalProposalID: [0] }
    const encoded_hex_string = verifierApi.encodeRemoveDataCapParameters(params)
    expect(encoded_hex_string).toBe(hexStringToCompare)
    expect(compareStringToBytesArray(encoded_hex_string,bytes_array_to_compare)).toBeTruthy()

  })
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
