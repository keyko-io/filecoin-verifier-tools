const fs = require('fs')
const VerifyAPI = require('../../api/api2.js')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { BrowserProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const signer = require("@keyko-io/filecoin-signing-tools/js")
const constants = require("../constants")


let endpointUrl = constants.lotus_endpoint
let tokenPath = constants.token_path 

const provider = new Provider(endpointUrl, {
    token: async () => {
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.16Um5hVGO9jh7eSujEFp_t5EXIh3h4q-5XwZJLYzOww" 
    }
})

const client = new LotusRPC(provider, { schema: testnet.fullNode })
const api = new VerifyAPI(client)

let schema = {
    type: "hamt",
    key: "address",
    value: "bigint",
}

async function refreshLists() {

    let verifiers = await api.listVerifiers()
    let clients = await api.listVerifiedClients()

    let ver = ""
    for (let [k,v] of verifiers) {
        ver += `<p>${k}: ${v.toString(10)}</p>`
    }

    const elemVerifiers = document.getElementById('infoVerifiers')
    elemVerifiers.innerHTML = ver

    let client = ""
    for (let [k,v] of clients) {
        client += `<p>${k}: ${v.toString(10)}</p>`
    }

    const elemClients = document.getElementById('infoClients')
    elemClients.innerHTML = client

}

async function run() {

    await refreshLists()

    while (true) {
        await new Promise(resolve => { setTimeout(resolve, 1000) })
    }
}

run()

const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")
console.log("address", key.address)


window.addVerifiedClient = async function () {
    let address = document.getElementById("address").value
    await api.verifyClient(address, 10000000000000000000000n, key)
    await refreshLists()
 
}

window.refresh = async function () {
    await refreshLists() 
}

window.proposeVerifier = async function () {

    let account = document.getElementById("verifierAccount").value
    let datacap = 100000000000000000000000000000000000000000n
    await api.proposeVerifier(account, datacap, key)
}

window.approveVerifier = async function () {

    let rootkeyAccount = document.getElementById("rootkeyAccount").value
    let account = document.getElementById("verifierAccount2").value
    let transactionID = document.getElementById("transactionID").value

    let datacap = 100000000000000000000000000000000000000000n

    const mnemonic = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
    let key2 = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")



    await api.approveVerifier(account, datacap, rootkeyAccount, transactionID, key2) 
}

