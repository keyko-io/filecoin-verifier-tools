/* eslint-disable indent */
function parseMultisigNotaryRequest(commentBody) {
    const data = {
        regexMultisig: /##\s*Multisig\s*Notary\s*requested/m,
        totalDatacaps: /Total DataCap requested[\S\s]*?>(.*?)\n/,
        weeklyDatacap: /Expected weekly DataCap usage rate[\S\s]*?>(.*?)\n/,
    }

    const parsedData = {
        correct: true,
        multisigMessage: true,
        errorMessage: '',
    }

    for (const [key, value] of Object.entries(data)) {
        const regex = value

        if (key === 'regexMultisig') {
            const triggerMessageMatch = regex.test(commentBody)
            if (!triggerMessageMatch) {
                return {
                    multisigMessage: false,
                }
            }
        } else {
            const match = commentBody.match(regex)

            if (match[1]?.trim() === '') {
                parsedData.correct = false
                parsedData.errorMessage += `We could not find **${key}** field in the information provided\n`
            } else if (!match[1]?.trim().endsWith('iB')) {
                parsedData.correct = false
                parsedData.errorMessage += `DataCap info should ends with TiB or PiB : **${key}**\n`
            }

            if (match) {
                parsedData[key] = match[1].trim()
            }
        }
    }

    return parsedData
}

exports.parseMultisigNotaryRequest = parseMultisigNotaryRequest
