const lotus_endpoint = 'wss://lotus.filecoin.nevermined.rocks/rpc/v0'
const token_path = '../../lotus/token'
const lotus_token = process.env.LOTUS_NODE_TOKEN
const postgres_conn_url = 'postgres://postgres:1234@localhost:5432/lotus'
const verifier_mnemonic = process.env.VERIFIER_MNEMONIC || 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
const rootkey_mnemonic = process.env.ROOTKEY_MNEMONIC || 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
const path = "m/44'/1'/0/0"

module.exports = {
  lotus_endpoint,
  token_path,
  lotus_token,
  postgres_conn_url,
  verifier_mnemonic,
  rootkey_mnemonic,
  path,
}
