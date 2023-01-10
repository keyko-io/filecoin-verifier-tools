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

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file']

const spreadsheetId = process.env.SPREADSHEET_ID
const sheetName = process.env.SHEET_NAME_SPREADSHEET

exports.PATH_PREFIX = PATH_PREFIX
exports.COLUMN_MAPPING = COLUMN_MAPPING
exports.SCOPES = SCOPES
exports.spreadsheetId = spreadsheetId
exports.sheetName = sheetName
