/* eslint-disable indent */
function parseMultisigReconnectComment(commentBody) {
    const data = {
        regexRequest: /##\s*Multisig\s*Notary\s*Reconnection\s*Request/m,
        msigAddress: /Multisig Notary Address[\S\s]*?>(.*?)\n/,
        clientAddress: /Client Address[\S\s]*?>(.*?)\n/,
        issueURI: /Notary Governance Issue\n> (.*)/,
    }

    const parsedData = {
        correct: true,
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

            if (!match) continue

            if (match[1]?.trim() === '') {
                parsedData.correct = false
                parsedData.errorMessage += `We could not find **${key}** field in the information provided\n`
            }

            if (match) {
                parsedData[key] = match[1].trim()
            }
        }
    }
    return parsedData
};

exports.parseMultisigReconnectComment = parseMultisigReconnectComment
