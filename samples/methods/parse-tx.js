const methods = require('../../filecoin/methods').mainnet
const cbor = require('cbor')

function main() {
    console.log(process.argv[2])
    let arg = JSON.parse(process.argv[2])
    // console.log(methods.parse({to: 'f06', params: Buffer.from('gkQAn6lDRwBkAAAAAAA=', 'base64'), method: 2}))
    console.log(methods.parse({to: arg.To, params: Buffer.from(arg.Params, 'base64'), method: arg.Method}))
}

main()
