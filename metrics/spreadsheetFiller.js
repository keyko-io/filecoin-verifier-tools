// const fs = require('fs')
const { google } = require('googleapis')
// const MOCK_ISSUES = require('./mock-issues.json')
// const MOCK_UPDATE = require('./mock-update.json')

// TODO make a constnts file
const PATH_PREFIX = 'https://github.com/filecoin-project/filecoin-plus-large-datasets/issues'
const COLUMN_MAPPING = [ // map issue object with header and letter of column
  { id: 'issueNumber', header: 'Issue Number', columnLetter: 'A' },
  { id: 'title', header: 'Title', columnLetter: 'B' },
  { id: 'clientName', header: 'Client Name', columnLetter: 'C' },
  { id: 'created_at', header: 'Date of Creation', columnLetter: 'D' },
  { id: 'updated_at', header: 'Date of Last Update', columnLetter: 'E' },
  { id: 'closed_at', header: 'Date of Issue Closing', columnLetter: 'F' },
  { id: 'isOpen', header: 'Is Open', columnLetter: 'G' },
  { id: 'clientAddress', header: 'Client Address', columnLetter: 'H' },
  { id: 'msigAddress', header: 'Multisig Address', columnLetter: 'I' },
  { id: 'totalDataCapRequested', header: 'Total DataCap Requested', columnLetter: 'J' },
  { id: 'weeklyDataCapRequested', header: 'Weekly DataCap Requested', columnLetter: 'K' },
  { id: 'numberOfRequests', header: 'Number of Requests', columnLetter: 'L' },
  { id: 'status', header: 'Status', columnLetter: 'M' },
  { id: 'region', header: 'Region', columnLetter: 'N' },
  { id: 'author', header: 'Author', columnLetter: 'O' },
  { id: 'assignee', header: 'Assignee', columnLetter: 'P' },
]

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file']

// to load credentials from env file
const run = async (credentials, spreadsheetId, sheetName, issuesArray) => {
  try {
    const jwtAuth = await authorizeAndRun(credentials)
    await fillorUpdateSheet(jwtAuth, spreadsheetId, sheetName, issuesArray)
  } catch (error) {
    console.log('error filling up the spreadsheet', error)
  }
}

const fillorUpdateSheet = async (auth, spreadsheetId, sheetName, issuesArray) => {
  const sheets = google.sheets({ version: 'v4', auth })

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
  for (const issue of issuesArray) {
    // insert new issue if its number is not present in the spreadsheet
    let range = ''
    if (!issuesInSheet.find(() => issue.issueNumber.toString())) {
      for (const key of Object.keys(issue)) {
        const values = [[]]
        let cellContent = issue[key]

        if (key === 'title') {
          const hyperlink = `${PATH_PREFIX}/${issue.issueNumber}`
          cellContent = `=HYPERLINK("${hyperlink}", "${issue[key]}")`
        }

        const columnLetter = COLUMN_MAPPING.find(item => item.id === key).columnLetter

        // this is the cell to be updated
        range = `${sheetName}!${columnLetter}${numberOfRowsInSheet + 1}:${columnLetter}${numberOfRowsInSheet + 1}`
        values[0].push(cellContent)
        data.push({ range, values },
        )
      }
      numberOfRowsInSheet++
    } else {
      // update existing issue considering the header row
      const rowNumber = issuesInSheet.indexOf(String(issue.issueNumber)) + 1

      for (const key of Object.keys(issue)) {
        const values = [[]]
        // console.log( issue[key])
        let cellContent = issue[key]

        if (key === 'title') {
          const hyperlink = `${PATH_PREFIX}/${issue.issueNumber}`
          cellContent = `=HYPERLINK("${hyperlink}", "${issue[key]}")`
        }

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
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      data,
    },
  })
}

/**
 * @param {Object} credentials The authorization client credentials.
 */
const authorizeAndRun = async (credentials) => {
  const jwtAuth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    keyId: credentials.private_key_id,
    scopes: SCOPES,

  })
  return jwtAuth
}

// TODO run once to create the spreadsheet
// const createSpreadSheet = async (auth) => {
//   const sheets = google.sheets({
//     version: 'v4',
//     auth,
//   })

//   const drive = google.drive({
//     version: 'v2',
//     auth,
//   })

//   // TODO make this a single function and put the mail addresses in an env var array
//   try {
//     await drive.permissions.insert({
//       auth,
//       fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
//       requestBody: {
//         emailAddress: 'fabrizio@keyko.io',
//         role: 'writer',
//         type: 'user',
//         value: 'fabrizio@keyko.io',
//       },
//     })
//     await drive.permissions.insert({
//       auth,
//       fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
//       requestBody: {
//         emailAddress: 'ivan@keyko.io',
//         role: 'writer',
//         type: 'user',
//         value: 'ivan@keyko.io',
//       },
//     })
//     await drive.permissions.insert({
//       auth,
//       fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
//       requestBody: {
//         emailAddress: 'galen@fil.org',
//         role: 'writer',
//         type: 'user',
//         value: 'galen@fil.org',
//       },
//     })
//     await drive.permissions.insert({
//       auth,
//       fileId: '1VPp7ijhJYuDl1xNqosV1jm0sGkyKOGmcK4ujYtG8qZE',
//       requestBody: {
//         emailAddress: 'deep.kapur@protocol.ai',
//         role: 'writer',
//         type: 'user',
//         value: 'deep.kapur@protocol.ai',
//       },
//     })
//   } catch (error) {
//     console.log(error)
//   }
// }

exports.run = run
