/* eslint-disable indent */
function ldnv3TriggerCommentParser(commentBody) {

    const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '')
    const data = {
        isTriggerComment: "Datacap Request Trigger",
        totalDatacap: "Total DataCap requested",
        weeklyDatacap: "Expected weekly DataCap usage rate",
        clientAddress: "Client address",
    }

    const parsedData = {
        correct: true,
        errorMessage: '',
    }

    for (const [k, v] of Object.entries(data)) {
        if (k == "isTriggerComment") {
            parsedData["isTriggerComment"] = trimmed.includes(v)
            continue
        }
        const rg = new RegExp(`(?<=${v})(.*?)?(?=#)(?=#)|(?<=${v}).*$`)
        const result = trimmed?.match(rg)[0].trim() || null
        const resultIsNull = !result || !result.length || !result

        if (resultIsNull) {
            parsedData.correct = false
            parsedData.errorMessage += `We could not find **${v}** field in the information provided\n`
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.'
            continue
        }
        parsedData[k] = result ? result : null
    }
    return parsedData



}

exports.ldnv3TriggerCommentParser = ldnv3TriggerCommentParser
