/* eslint-disable indent */
export function parseMultisigNotaryRequest(commentBody) {
    const data = {
        regexMultisig: 'Multisig Notary requested',
        totalDatacaps: 'Total DataCap requested',
        weeklyDatacap: 'Expected weekly DataCap usage rate',
}

const parsedData = {
    correct: true,
    multisigMessage: true,
    errorMessage: '',
}

const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '')

for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value})(.*?)?(?=#)(?=#)|(?<=${value}).*$`)

    if (key === 'regexMultisig') {
        parsedData.multisigMessage = trimmed.includes(value)
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