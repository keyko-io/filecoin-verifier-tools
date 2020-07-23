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

