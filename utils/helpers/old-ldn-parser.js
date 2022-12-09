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

// const regexForAdress = /^(f1|f3)/

const text = `
      - Organization Name: 
      - Website / Social Media: www.fun.com
      - Region: turkey
      - Total amount of DataCap being requested (between 500 TiB and 5 PiB): 5PiB
      - Weekly allocation of DataCap requested (usually between 1-100TiB): 100TiB
      - On-chain address for first allocation: f1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq
      - Type: 
      - Identifier: 
   `

for (const [key, value] of Object.entries(data)) {
  const regex = value

  const match = text.match(regex)

  if (match[1].trim() === '') {
    if (key === 'isCustomNotary' || key === 'identifier') continue
    parsedData.correct = false
    parsedData.errorMessage += `We could not find **${key}** field in the information provided\n`
    parsedData[key] = ''
    continue
  }

  if (match && match.length > 1) {
    parsedData[key] = match[1].trim()
  }
}

console.log(parsedData)
