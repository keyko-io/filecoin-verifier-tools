/* eslint-disable no-useless-escape */
import { regexForAdress } from '../../common-utils'

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
    dataType: 'Data Type of Application'
  }

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
    isAddressFormatted: false,
    dataType: ''
  }

  const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value}:)(.*?)(?=-)`)

    let result
    if (key === 'identifier') {
      const matched = issueContent?.match(value)
      result = matched && matched?.length > 0 ? issueContent.match(value)[1].trim() : null
    } else {
      const matched = trimmed?.match(rg)
      result = matched && matched?.length > 0 ? matched[0].trim() : null
    }

    const resultIsNull = !result || !result.length

    if (resultIsNull) {
      if (key === 'identifier' || key === 'isCustomNotary' || key === "region") continue
      parsedData.correct = false
      parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`
      if (parsedData.errorDetails !== '') { parsedData.errorDetails = 'Unable to find required attributes.' }
      continue
    }

    if (key === 'isCustomNotary') {
      //@ts-ignore
      parsedData[key] = result === 'Custom Notary'
      continue
    }

    if (key === 'address') {
      if (result.includes("_Please respond")) {
        parsedData[key] = result.split("_")[0]
      } else if (result.includes("## Project details")) {
        parsedData[key] = result.replace("## Project details", "")
      } else {
        parsedData[key] = result || null
      }
      parsedData["isAddressFormatted"] = regexForAdress.test(parsedData[key]);
      continue
    }

    parsedData[key] = result || null
  }

  return parsedData
}
