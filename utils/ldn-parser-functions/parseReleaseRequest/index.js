/* eslint-disable indent */
function parseReleaseRequest(commentBody) {
    const data = {
        regexMultisig: /##\s*DataCap\s*Allocation\s*requested/m,
        notaryAddress: /Multisig Notary address[\S\s]*?>(.*?)\n/,
        clientAddress: /Client address[\S\s]*?>(.*?)\n/,
        allocationDatacap: /DataCap allocation requested\s*>\s*(\S+)/,
    }

    const parsedData = {
        correct: true,
        multisigMessage: true,
        errorMessage: '',
    }

    for (const [key, value] of Object.entries(data)) {
        const regex = value

        if (key === 'regexMultisig') {
            const multisigMessage = regex.test(commentBody)

            if (!multisigMessage) {
                return {
                    multisigMessage: false,
                }
            }
        } else {
            const match = commentBody.match(regex)

            if (match[1]?.trim() === '') {
                parsedData.correct = false
                parsedData.errorMessage += `We could not find **${key}** field in the information provided\n`
            }

            if (match) {
                parsedData[key] = match[1].trim()

                if (key === 'allocationDatacap') {
                    parsedData.allocationDataCapAmount = [match[1].trim()]
                }
            }
        }
    }

    return parsedData
}

exports.parseReleaseRequest = parseReleaseRequest
