/* eslint-disable indent */
function ldnv3TriggerCommentParser(commentBody) {

    const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '')
    const data = {
        // isTriggerComment: "Datacap Request Trigger",
        totalDatacap: "Total DataCap requested",
        weeklyDatacap: "Expected weekly DataCap usage rate",
        clientAddress: "Client address",
    }

    const parsedData = {
        correct: true,
        errorMessage: '',
    }

    for (const [k, v] of Object.entries(data)) {
        if (k === "isTriggerComment ") {
            parsedData.isTriggerComment = trimmed.includes(v)
            continue
        }
        // const reg = new RegExp(`(?<=${v})(.*?)(?=#)`)
        const rg = new RegExp(`(?<=${v})(.*?)?(?=#)(?=#)|(?<=${v}).*$`)
        const regexIsNull = !trimmed.match(rg) || !trimmed.match(rg).length || !trimmed.match(rg)[0]

        if (regexIsNull) {
            parsedData.correct = false
            parsedData.errorMessage += `We could not find **${v}** field in the information provided\n`
            if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.'
            continue
        }
        parsedData[k] = trimmed.match(rg) ? trimmed.match(rg)[0].replace(/\s*/g,"") : null
    }
    return parsedData



}

exports.ldnv3TriggerCommentParser = ldnv3TriggerCommentParser
