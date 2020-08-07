const signer = require("@keyko-io/filecoin-signing-tools/js")

class MockWallet {

    constructor (mnemonic, path) {
        this.mnemonic = mnemonic
        this.path = path
    }


    async getAccounts(nStart = 0, nEnd = 5) {

        const accounts = []
        for (let i = nStart; i < nEnd; i += 1) {
            accounts.push(
                signer.keyDerive(this.mnemonic, `${this.path}${i}`, '').address
            )
        }
        return accounts

    }


    async sign(filecoinMessage, indexAccount) {

        const private_hexstring = signer.keyDerive(this.mnemonic, this.path + indexAccount.toString(), '').private_hexstring

        const signedMessage = signer.transactionSign(
          filecoinMessage,
          private_hexstring
        )
        return JSON.stringify({
            Message: {
              From: signedMessage.message.from,
              GasLimit: signedMessage.message.gaslimit,
              GasPrice: signedMessage.message.gasprice,
              Method: signedMessage.message.method,
              Nonce: signedMessage.message.nonce,
             // Params: signedMessage.message.params,
             Params: Buffer.from(signedMessage.message.params, "hex").toString("base64"),
              To: signedMessage.message.to,
              Value: signedMessage.message.value,
            },
            Signature: {
              Data: signedMessage.signature.data,
              Type: signedMessage.signature.type,
            }
        })

    }

}


module.exports = MockWallet