const signer = require('@zondax/filecoin-signing-tools')
const fetch = require('node-fetch')
const methods = require('../../filecoin/methods')
const cbor = require('cbor')
const constants = require('../constants')

const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
const key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", '')
console.log('address', key.address)

const multisig = {
  3: {
    name: 'approve',
    input: {
      id: 'int',
      hash: 'buffer',
    },
  },
  2: {
    name: 'propose',
    input: {
      to: 'address',
      value: 'bigint',
      method: 'int',
      params: 'buffer',
    },
  },
}

const verifreg = {
  2: {
    name: 'add verifier',
    input: {
      verifier: 'address',
      cap: 'bigint',
    },
  },
}

const reg = {
  t080: multisig,
  t06: verifreg,
}

function getMethod (to, method, params) {
  const actor = reg[to]
  const { name, input } = actor[method]
  return { name, params: methods.decode(input, cbor.decode(params)) }
}

function handleTx (tx) {
  console.log(tx)
  const { name, params } = getMethod(tx.to_address, tx.method, Buffer.from(tx.params, 'base64'))
  console.log(name, params)
  if (tx.to_address === 't080' && tx.method === 2) {
    console.log(getMethod(params.to, params.method, params.params))
  }
}

async function main () {
  const res = await fetch(`http://localhost:3000/from/${key.address}`)
  const lst = (await res.json()).txs
  lst.forEach(handleTx)
}

main()
