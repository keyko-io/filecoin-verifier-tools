/* eslint-disable indent */
function parseWeeklyDataCapAllocationUpdateRequest(commentBody) {
    const data = {
        regexRequest: /##\s*Weekly\s*DataCap\s*Allocation\s*Update\s*requested/m,
        allocationDatacap: /Update to expected weekly DataCap usage rate\s*>\s*(\S+)/,
    }

    const parsedData = {
        correct: true,
        multisigMessage: true,
        errorMessage: '',
    }

    for (const [key, value] of Object.entries(data)) {
        const regex = value

        if (key === 'regexRequest') {
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

exports.parseWeeklyDataCapAllocationUpdateRequest = parseWeeklyDataCapAllocationUpdateRequest
