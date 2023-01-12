/* eslint-disable no-useless-escape */
export function parseIssue(issueContent) {
  const data = {
    name: 'Name',
    organization: 'Affiliated organization',
    address:
      'On-chain address to be notarized \\(recommend using a new address\\)',
    country: 'Country of Operation',
    region: 'Country of Operation',
    useCases: 'Use case\\(s\\) to be supported',
    datacapRequested: 'DataCap requested for allocation \\(10TiB - 1PiB\\)',
    behalf:
      /-\s*Are you applying on behalf of yourself or an organization\?:\s*(.*)/m,
  }

  const parsedData = {
    name: '',
    organization: '',
    address: '',
    country: '',
    region: '',
    useCases: '',
    datacapRequested: '',
    behalf:
      /-\s*Are you applying on behalf of yourself or an organization\?:\s*(.*)/m,
    correct: true,
    errorMessage: '',
    errorDetails: '',
  }

  const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value}:)(.*?)(?=-)`)

    let result
    if (key === 'behalf') {
       const matched = issueContent.match(value)
      result =  matched && matched?.length > 0 ? matched[1].trim() : null
    } else {
      const matched = trimmed?.match(rg)
      result = matched && matched?.length > 0 ? matched[0].trim() : null
    }

    const resultIsNull = !result || !result.length

    if (resultIsNull) {
      parsedData.correct = false
      parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`
    }

    parsedData[key] = result || null
  }

  return parsedData
}
