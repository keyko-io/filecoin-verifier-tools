const fs = require('fs')
const { google } = require('googleapis')
// const MOCK_ISSUES = require('./mock-issues.json')
const MOCK_UPDATE = require('./mock-update.json')

const COLUMN_MAPPING = [ // map issue object with header and letter of column
  { id: 'issueNumber', header: 'Issue Number', columnLetter: 'A' },
  { id: 'clientName', header: 'Client Name', columnLetter: 'B' },
  { id: 'githubLink', header: 'Github Link', columnLetter: 'C' },
  { id: 'clientAddress', header: 'Client Address', columnLetter: 'D' },
  { id: 'msigAddress', header: 'Multisig Address', columnLetter: 'E' },
  { id: 'totalDataCapRequested', header: 'Total DataCap Requested', columnLetter: 'F' },
  { id: 'weeklyDataCapRequested', header: 'Github Link', columnLetter: 'G' },
  { id: 'numberOfRequests', header: 'Number of Requests', columnLetter: 'H' },
  { id: 'status', header: 'Status', columnLetter: 'I' },
  { id: 'region', header: 'Region', columnLetter: 'J' },
  { id: 'author', header: 'Author', columnLetter: 'K' },
]

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file']

// Load client secrets from a local file.
// fs.readFile('credentials.json', async (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err)

//   // Authorize a client with credentials, then call the Google Sheets API.
//   await authorizeAndRun(JSON.parse(content), fillorUpdateSheet)
// })


//to load credentials from env file
export const run = async (content) => {
 try {
    await authorizeAndRun(JSON.parse(content), fillorUpdateSheet)
 } catch (error) {
   console.log('error filling up the spreadsheet', error)
 }

}

const fillorUpdateSheet = async (auth) => {
  // const fillSpreadSheet = (spreadsheetId = "1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE", issueArray ) => {
  const sheets = google.sheets({ version: 'v4', auth })

  spreadsheetId = '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE'
  const sheetName = 'Sheet1'
  // Get the values in the column A
  const firstColumn = (await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [`${sheetName}!A2:A`],
    majorDimension: 'COLUMNS',
  }))

  const issuesInSheet = firstColumn.data.valueRanges[0].values ? firstColumn.data.valueRanges[0].values[0] : []
  let numberOfRowsInSheet = issuesInSheet.length + 1 // counting how many issues are there in the spreadsheet

  // loop the issueArray, if the current issue number is not present, insert the issue info in the row
  const data = []
  for (const issue of MOCK_UPDATE) {
    // for(let issue of MOCK_ISSUES){
    // insert new issue if its number is not present in the spreadsheet
    if (!issuesInSheet.includes(issue.issueNumber)) {
      let range = ''
      for (const key of Object.keys(issue)) {
        const values = [[]]
        const cellContent = issue[key]
        const columnLetter = COLUMN_MAPPING.find(item => item.id === key).columnLetter

        // this is the cell to be updated
        range = `${sheetName}!${columnLetter}${numberOfRowsInSheet + 1}:${columnLetter}${numberOfRowsInSheet + 1}`
        values[0].push(cellContent)
        data.push({ range, values },
        )
      }
      numberOfRowsInSheet++
    }
    // update existing issue
    else {
      const rowNumber = issuesInSheet.indexOf(issue.issueNumber) + 1
      for (const key of Object.keys(issue)) {
        const values = [[]]
        // console.log( issue[key])
        const cellContent = issue[key]
        const columnLetter = COLUMN_MAPPING.find(item => item.id === key).columnLetter

        // this is the cell to be updated
        range = `${sheetName}!${columnLetter}${rowNumber + 1}:${columnLetter}${rowNumber + 1}`
        values[0].push(cellContent)
        data.push({ range, values },
        )
      }
    }
  }
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    valueInputOption: 'RAW',
    requestBody: {
      data,
    },
  })
}

/**
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorizeAndRun = async (credentials, callback) => {
  const jwtAuth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    keyId: credentials.private_key_id,
    scopes: SCOPES,

  })

  await callback(jwtAuth)
}

const createSpreadSheet = async (auth) => {
  const sheets = google.sheets({
    version: 'v4',
    auth,
  })

  const drive = google.drive({
    version: 'v2',
    auth,
  })

  //TODO make this a single function and put the mail addresses in an env var array
  try {
    await drive.permissions.insert({
      auth,
      fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
      requestBody: {
        emailAddress: 'fabrizio@keyko.io', 
        role: 'writer',
        type: 'user',
        value: 'fabrizio@keyko.io',
      }
    })
    await drive.permissions.insert({
      auth,
      fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
      requestBody: {
        emailAddress: 'ivan@keyko.io', 
        role: 'writer',
        type: 'user',
        value: 'ivan@keyko.io',
      }
    })
    await drive.permissions.insert({
      auth,
      fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
      requestBody: {
        emailAddress: 'galen@fil.org', 
        role: 'writer',
        type: 'user',
        value: 'galen@fil.org',
      }
    })
    await drive.permissions.insert({
      auth,
      fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
      requestBody: {
        emailAddress: 'deep.kapur@protocol.ai', 
        role: 'writer',
        type: 'user',
        value: 'deep.kapur@protocol.ai',
      }
    })
    
  } catch (error) {
    console.log(error)
  }
}
