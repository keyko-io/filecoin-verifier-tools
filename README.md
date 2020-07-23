# js-hamt-ipld

Javascript implementation of a HAMT using ipld

For now, just testing how this could be implemented, works for getting the verifiers and their info.

Files
 * hash.js: simple implementation of murmur3 hash
 * hamt.js: implements lookup and iterating HAMT tries
 * methods.js: has the following methods
   * `signTx`: gets the nonce from RPC and signs a transaction
   * `sendTx`: same as above, but also sends the transaction
   * `decode`: decodes data from raw format
   * `encode`: encoding the data
   * `actor`: convenience for encoding actor info

Samples
 * add-client.js: adds a new verified client with cap
 * approve-verifer.js: approve adding a verifier in multisig
 * propose-verifier.js: propose adding a verifier in multisig
 * index-transaction.js: add transactions from blocks to postgres
 * tx-server.js: serve a list of transactions from postgres
 * tx-client.js: get a list of transactions and parse parameters
 * multisig.js: show multisig info
 * verified.js: list verified clients
 * verifiers.js: list verifiers
 * info-browser.js and test.html: check that everything works in browser
