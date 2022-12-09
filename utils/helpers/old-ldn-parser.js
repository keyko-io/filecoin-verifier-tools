const data = {
  name: 'Name:',
  region: 'Region:',
  website: 'Media:',
  datacapRequested: 'PiB:',
  dataCapWeeklyAllocation: '100TiB:',
  address: 'allocation:',
  isCustomNotary: 'Type:',
  identifier: 'Identifier:',
}

const parsedData = {
  correct: true,
  errorMessage: '',
  errorDetails: '',
}

const regexForAdress = /^(f1|f3)/

const text = `
      - Organization Name: fun
      - Website / Social Media: www.fun.com
      - Region: turkey
      - Total amount of DataCap being requested (between 500 TiB and 5 PiB: 5PiB
      - Weekly allocation of DataCap requested (usually between 1-100TiB: 100TiB
      - On-chain address for first allocation: f1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq
      - Type: aynen
      - Identifier: pasam
   `

for (const [key, value] of Object.entries(data)) {
  const rg = new RegExp(`(?<=${value})(.*)`)

  const regexIsNull = !text.match(rg) || !text.match(rg)[0].trim()

  if ((key === 'identifier' || key === 'isCustomNotary') && regexIsNull) continue

  if (regexIsNull) {
    parsedData.correct = false
    parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`
    if (parsedData.errorDetails !== '') parsedData.errorDetails = 'Unable to find required attributes.'
    continue
  }

  parsedData[key] = rg.exec(text)[0].trim()

  if (key === 'address') {
    parsedData['isAddressFormatted'] = regexForAdress.test(parsedData[key]) //eslint-disable-line
  }
}

console.log(parsedData)
