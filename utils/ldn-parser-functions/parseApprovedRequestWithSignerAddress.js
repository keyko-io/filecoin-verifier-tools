/* eslint-disable indent */
function parseApprovedRequestWithSignerAddress(commentBody) {
    const data = {
        method: /##\s*Request\s*((Approved)|(Proposed))/m,
        address: /#### Address\s*>\s*(.*)/,
        datacap: /#### Datacap Allocated\s*>\s*(.*)/,
        signerAddress: /#### Signer Address\s*>\s*(.*)/,
        message: /#### Message sent to Filecoin Network\s*>\s*(.*)/,
    }

    let parsedData = {
        correct: true,
        approvedMessage: true,
        errorMessage: '',
    }

    for (const [key, value] of Object.entries(data)) {
        const regex = value

        const match = commentBody.match(regex)

        if (!match) {
            if (key === 'method') {
                parsedData = {
                    approvedMessage: false,
                }
                break
            }
            parsedData.correct = false
            parsedData.errorMessage += `We could not find **${key}** field in the information provided\n`
        }

        if (match) {
            parsedData[key] = match[1].trim()
        }
    }

    return parsedData
}

exports.parseApprovedRequestWithSignerAddress = parseApprovedRequestWithSignerAddress
