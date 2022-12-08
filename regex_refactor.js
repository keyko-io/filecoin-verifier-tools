const data = {
  name: 'Name:',
  region: 'Region:',
  website: 'Media:',
  datacapRequested: 'PiB]:',
  dataCapWeeklyAllocation: '100TiB]:',
  address: 'allocation:',
  isCustomNotary: 'Type:',
  identifier: 'Identifier:',
}

const parsedData = {}

const text = `
    - Organization Name:
    - Website / Social Media: www.tvcc.kr / https://www.youtube.com/c/TVCC-Broadcast
    - Region: Asia excl. Japan
    - Total amount of DataCap being requested (between 500 TiB and 5 PiB]: 5PiB
    - Weekly allocation of DataCap requested (usually between 1-100TiB]: 100TiB
    - On-chain address for first allocation: t1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq
    - Type: Custom Notary
    - Identifier: E-fil 
 `

for (const [key, value] of Object.entries(data)) {
  const rg = new RegExp(`(?<=${value})(.*)`)

  parsedData[key] = rg.exec(text)[0].trim()
}

console.log(parsedData)
