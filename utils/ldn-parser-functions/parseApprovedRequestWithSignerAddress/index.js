/* eslint-disable indent */
/* eslint-disable no-useless-escape */
export function parseApprovedRequestWithSignerAddress(issueContent) {
    const data = {
        method: 'Request',
        address: 'Address',
        datacap: 'Datacap Allocated',
        signerAddress: 'Signer Address',
        message: 'Message sent to Filecoin Network',
        uuid: 'Id',
    }
    const parsedData = {
        correct: true,
        errorMessage: '',
        errorDetails: '',
    }

    const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

    for (const [key, value] of Object.entries(data)) {
        let rg = new RegExp(`(?<=${value}>)(.*?)(?=#)`)

        if (key === 'address') {
            // here some space problem which is always giving the => signer address thats why i create another rg with space
            rg = new RegExp(`(?<=${value} >)(.*?)(?=#)`)
        }

        if (key === 'method') {
            parsedData.approvedMessage = trimmed.includes(value)
            continue
        }

        const result = trimmed?.match(rg)[0].trim() || null
        const resultIsNull = !result || !result.length

        if (resultIsNull) {
            parsedData.correct = false
            parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.'
            continue
        }
        parsedData[key] = result || null
    }

    return parsedData
}
