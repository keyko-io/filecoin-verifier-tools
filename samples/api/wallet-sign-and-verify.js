import VerifyAPI from '../../api/api.js'
import MockWallet from '../mockWallet.js'
import { lotus_endpoint, token_path, rootkey_mnemonic, path } from '../constants.js'
import { readFileSync } from 'fs'
const endpointUrl = lotus_endpoint
const tokenPath = token_path

const mockWallet = new MockWallet(rootkey_mnemonic, path)

const api = new VerifyAPI(
  VerifyAPI.standAloneProvider(endpointUrl, {
    token: async () => {
      return readFileSync(tokenPath)
    },
  },
  ), mockWallet,
)

async function walletSignMessageApi() {
  try {
    const walletList = await api.client.walletList()
    const sender = walletList[1]
    const nonce = await api.client.mpoolGetNonce(sender)
    console.log(nonce)
    const to = 't1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq'
    const from = sender
    const params = 'miao'

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

    const walletSignMessage = await api.client.walletSignMessage(
      sender,
      msg,
    )
    const pushedMsg = await api.client.mpoolPush(walletSignMessage)
    console.log('walletSignMessage', walletSignMessage)
    console.log('Pushed msg:', pushedMsg)
  } catch (error) {
    console.log(error)
  }
}

async function walletVerifyMessage() {
  try {
    const msg = await api.client.chainGetMessage({
      '/': 'bafy2bzaceasjil3ydmtw2qgiizgn5wat3zu4vrt3hazkgdw2dmw3qgiccaqvy',
    })
    // console.log('ChainGetMessage:',msg)
    console.log('parsedMSG', msg)
    console.log(msg.Params === 'miao')
    return msg.Params === 'miao'
  } catch (error) {
    console.log(error)
  }
}

async function findMessage() {
  console.log(await api.client.chainGetMessage(

    { '/': 'bafy2bzacec64qbngxkapkavd4g6h33maubxasujzj2ms5vss4clteobeslhmg' },

  ))
}

async function lookForMessages() {
  try {
    const head = await api.client.chainHead()
    // console.log("head", head)
    // console.log("Block", head.Blocks[0])
    // const tset = await api.client.chainGetTipSetByHeight(head.Height, head.Cids)
    // console.log("tset", tset)

    // console.log("messages", head.Blocks.map(item=> item.Messages))

    const messages = await api.client.stateListMessages(
      {
        To: 't1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq',
        From: 't13anukxkgvngz46fsjxta3kfzedgnkylfpoff36q',
      },
      // genesis.Cids,
      head.Cids,
      Math.round(head.Height - head.Height * 0.5), // 0
    // 0 //0
    )

    console.log('retval', messages)
  } catch (error) {
    console.log(error)
  }
}

findMessage()
lookForMessages()
walletVerifyMessage()
walletSignMessageApi()
