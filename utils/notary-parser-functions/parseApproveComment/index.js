export function parseApproveComment(commentBody) {
  const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '')

  const data = {
    approved: 'Request Approved',
    address: 'Address',
    datacap: 'Datacap Allocated',
  }

  const parsedData = {
    correct: true,
    errorMessage: '',
    approvedMessage: true,
  }

  for (const [k, v] of Object.entries(data)) {
    if (k === 'approved') {
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
