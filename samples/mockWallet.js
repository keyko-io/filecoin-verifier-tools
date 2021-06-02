const signer = require('@zondax/filecoin-signing-tools/js')

class MockWallet {
  constructor(mnemonic, path) {
    this.mnemonic = mnemonic
    this.path = path
  }

  async getAccounts(nStart = 0, nEnd = 10) {
    const accounts = []
    for (let i = nStart; i < nEnd; i += 1) {
      accounts.push(
        signer.keyDerive(this.mnemonic, `${this.path}/${i}`, '').address,
      )
    }
    return accounts
  }

  async getAccountInfo(nStart = 0, nEnd = 5) {
    const accounts = []
    for (let i = nStart; i < nEnd; i += 1) {
      const account = signer.keyDerive(this.mnemonic, `${this.path}/${i}`, '')
      accounts.push({
        address: account.address,
        private: account.private_hexstring,
        public: account.public_hexstring,
        check: signer.keyRecover(account.private_hexstring, true).address,
      })
    }
    return accounts
  }

  async sign(filecoinMessage, indexAccount) {
    const private_hexstring = signer.keyDerive(this.mnemonic, `${this.path}/${indexAccount.toString()}`, '').private_hexstring

    return signer.transactionSignLotus(
      filecoinMessage,
      private_hexstring,
    )
  }
}

module.exports = MockWallet
