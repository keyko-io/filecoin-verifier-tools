//@ts-nocheck
/* eslint-disable indent */
/**
 * @param commentBody
 * @returns parsedData, the data parsed out of the comment
 * @trimmed we need to trim the body, removing newlines and other characters, to ease the parsing
 * @data is the data field we want to get
 * @rg is the regex we dynamically create in the for loop
 * @result is the result of the regex
 * @link to regex --> https://regex101.com/r/31sf7d/1
 */
export function ldnv3TriggerCommentParser(commentBody) {
    const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '')
    const data = {
        isTriggerComment: 'Datacap Request Trigger',
        totalDatacap: 'Total DataCap requested',
        weeklyDatacap: 'Expected weekly DataCap usage rate',
        clientAddress: 'Client address',
    }

    const parsedData = {
        correct: true,
        errorMessage: '',
        isTriggerComment: '',
        totalDatacap: '',
        weeklyDatacap: '',
        clientAddress: '',
    }

    for (const [k, v] of Object.entries(data)) {
        if (k === 'isTriggerComment') {
            parsedData.isTriggerComment = trimmed.includes(v)
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
        parsedData[k] = result || null
    }
    return parsedData
}
