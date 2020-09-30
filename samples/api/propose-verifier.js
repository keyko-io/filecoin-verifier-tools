const VerifyAPI = require('../../api/api.js')
const methods = require('../../filecoin/methods.js')
const MockWallet = require('../mockWallet')
const fs = require('fs')
const constants = require('../constants')

const endpointUrl = constants.lotus_endpoint
const tokenPath = constants.token_path

const mockWallet = new MockWallet(constants.nerpa_mnemonic, constants.path)

const api = new VerifyAPI(VerifyAPI.standAloneProvider(endpointUrl, {
  token: async () => {
    return fs.readFileSync(tokenPath)
  },
}), mockWallet)

async function main() {
  console.log(methods.verifreg.addVerifier(process.argv[2], 100000000000000000000000000000000000000000n).params.toString('hex'))
  await api.proposeVerifier(process.argv[2], 100000000000000000000000000000000000000000n, 2)
  process.exit(0)
}

main()
