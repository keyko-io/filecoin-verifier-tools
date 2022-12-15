function parseOldLDN(issueContent) {
  const data = {
    name: /Name: (.*)/,
    region: /Region: (.*)/,
    website: /Media: (.*)/,
    datacapRequested: /PiB\): (.*)/,
    dataCapWeeklyAllocation: /100TiB\): (.*)/,
    address: /allocation: (.*)/,
    isCustomNotary: /Type: (.*)/,
    identifier: /Identifier: (.*)/,
  }

  const parsedData = {
    correct: true,
    errorMessage: '',
    errorDetails: '',
  }

  const regexForAdress = /^(f1|f3)/

  for (const [key, value] of Object.entries(data)) {
    const regex = value

    const match = issueContent.match(regex)

    if (!match) continue

    if (match[1].trim() === '') {
      if (key === 'isCustomNotary' || key === 'identifier') continue
      parsedData.correct = false
      parsedData.errorMessage += `We could not find **${key}** field in the information provided\n`
      continue
    }

    if (key === 'isCustomNotary') {
      parsedData[key] = match[1].trim() === 'Custom Notary'
      continue
    }

    if (match && match.length > 1) {
      parsedData[key] = match[1].trim()
    }

    if (key === 'address') {
      parsedData["isAddressFormatted"] = regexForAdress.test(parsedData[key]) //eslint-disable-line
    }
  }

  return parsedData
}

exports.parseOldLDN = parseOldLDN
