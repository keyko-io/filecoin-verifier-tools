/* eslint-disable indent */
export function parseWeeklyDataCapAllocationUpdateRequest(commentBody) {
  const data = {
    regexRequest: 'Weekly DataCap Allocation Update requested',
    allocationDatacap: 'Update to expected weekly DataCap usage rate',
  }

  const parsedData = {
    regexRequest: '',
    allocationDatacap: '',
    correct: true,
    multisigMessage: true,
    errorDetails: '',
    errorMessage: '',
  }

  const trimmed = commentBody.replace(/(\n)|(\r)|[>]/gm, '')

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value})(.*?)?(?=#)(?=#)|(?<=${value}).*$`)

    if (key === 'regexRequest') {
      parsedData.multisigMessage = trimmed.includes(value)
      continue
    }

    const matched = trimmed?.match(rg)
    const result = matched && matched?.length > 0 ? matched[0].trim() : null
    const resultIsNull = !result || !result.length

    if (resultIsNull) {
      parsedData.correct = false
      parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`
      if (parsedData.errorDetails !== '') { parsedData.errorDetails = 'Unable to find required attributes.' }
      continue
    }
    parsedData[key] = result || null
  }

  return parsedData
}
