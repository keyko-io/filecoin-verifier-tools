/* eslint-disable no-useless-escape */
/**
 *
 * @param {*} issueContent
 * @returns
 * @link to regex https://regex101.com/r/dJ69Sk/1
 */
export function parseOldLDN(issueContent) {
  const data = {
    name: 'Organization Name',
    region: 'Region',
    website: 'Website \\/ Social Media',
    datacapRequested:
      'Total amount of DataCap being requested \\(between 500 TiB and 5 PiB\\)',
    dataCapWeeklyAllocation:
      'Weekly allocation of DataCap requested \\(usually between 1-100TiB\\)',
    address: 'On-chain address for first allocation',
    isCustomNotary: 'Type',
    identifier: /Identifier: (.*)/,
  }

  const regexForAdress = /^(f1|f3)/

  const parsedData = {
    name: '',
    region: '',
    website: '',
    datacapRequested: '',
    dataCapWeeklyAllocation: '',
    address: '',
    isCustomNotary: '',
    identifier: '',
    correct: true,
    errorMessage: '',
    errorDetails: '',
  }

  const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value}:)(.*?)(?=-)`)

    let result
    if (key === 'identifier') {
      result = issueContent.match(value)[1].trim()
    } else {
      result = trimmed?.match(rg)[0].trim() || null
    }

    const resultIsNull = !result || !result.length

    if (resultIsNull) {
      if (key === 'identifier' || key === 'isCustomNotary') continue
      parsedData.correct = false
      parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`
      if (parsedData.errorDetails !== '') { parsedData.errorDetails = 'Unable to find required attributes.' }
      continue
    }

    if (key === 'isCustomNotary') {
      parsedData[key] = result === 'Custom Notary'
      continue
    }

    parsedData[key] = result || null

    if (key === 'address') {
      parsedData["isAddressFormatted"] = regexForAdress.test(parsedData[key]); //eslint-disable-line
    }
  }

  return parsedData
}
