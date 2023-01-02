/* eslint-disable indent */
function parseReleaseRequest(commentBody) {
    const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '')
    const data = {
        regexMultisig: 'DataCap Allocation requested',
        notaryAddress: 'Multisig Notary address',
        clientAddress: 'Client address',
        allocationDatacap: 'DataCap allocation requested',
    }

    const parsedData = {
        correct: true,
        multisigMessage: true,
        errorMessage: '',
    }

    for (const [k, v] of Object.entries(data)) {
        if (k === 'regexMultisig') {
            parsedData.multisigMessage = trimmed.includes(v)
            continue
        }
        const rg = new RegExp(`(?<=${v})(.*?)?(?=#)(?=#)|(?<=${v}).*$`)
        const result = trimmed?.match(rg)[0].trim() || null
        const resultIsNull = !result || !result.length

        if (resultIsNull) {
            parsedData.correct = false
            parsedData.errorMessage += `We could not find **${v}** field in the information provided\n`
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.'
            continue
        }

        if (k === 'allocationDatacap') {
            parsedData.allocationDataCapAmount = [result]
        }

        parsedData[k] = result || null
    }
    return parsedData
}

exports.parseReleaseRequest = parseReleaseRequest
