// @ts-nocheck
const { google } = require("googleapis");
const {
  PATH_PREFIX,
  COLUMN_MAPPING,
  SCOPES,
  spreadsheetId,
  sheetName,
} = require("./constants");
const { credentials } = require("./credentials");

export const runSpreadSheetFiller = async (issuesArray) => {
  try {
    const jwtAuth = await authorizeAndRun(credentials);
    // console.log("jwtAuth",jwtAuth)
    await fillOrUpdateSpreadsheet(jwtAuth, issuesArray);
  } catch (error) {
    console.log("error filling up the spreadsheet", error);
  }
};

const fillOrUpdateSpreadsheet = async (jwtAuth, issuesArray) => {
  try {
    const sheets = google.sheets({ version: "v4", auth: jwtAuth });

    // Get the values in the column A
    const firstColumn = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [`${sheetName}!A2:A`],
      majorDimension: "COLUMNS",
    });

    const issuesInSheet = firstColumn.data.valueRanges[0].values
      ? firstColumn.data.valueRanges[0].values[0]
      : [];

    const data = await addOrUpdateSpreadsheet(
      issuesArray,
      issuesInSheet,
      sheets
    );

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        data,
      },
    });
  } catch (error) {
    console.log("error in spreadsheetFiller fillOrUpdateSpreadsheet", error);
  }
};

const addOrUpdateSpreadsheet = async (issuesArray, issuesInSheet, sheets) => {
  try {
    let numberOfRowsInSheet = issuesInSheet.length + 1; // counting how many issues are there in the spreadsheet
    const data = [];
    let range = "";

    for (const issue of issuesArray) {
      if (issuesInSheet.includes(String(issue.issueNumber))) {
        // if present --> get all the value of the cells of the issue
        const rowNumber = issuesInSheet.indexOf(String(issue.issueNumber)) + 2;

        const allRowValues = await sheets.spreadsheets.values.batchGet({
          spreadsheetId,
          ranges: [`${sheetName}!A${rowNumber}:P${rowNumber}`],
          majorDimension: "COLUMNS",
        });

        const arrayOfCellValuesInRow = allRowValues.data.valueRanges.map(
          (value) => value.values.map((item) => (item[0] ? item[0] : ""))
        )[0];

        // map the array of values in the row
        const mappedRowObject = {};
        for (let i = 0; i < arrayOfCellValuesInRow.length; i++) {
          mappedRowObject[COLUMN_MAPPING[i].id] = arrayOfCellValuesInRow[i];
        }

        for (const key of Object.keys(issue)) {
          const values = [[]];
          const columnLetter = COLUMN_MAPPING.find(
            (item) => item.id === key
          ).columnLetter;
          // this is the cell to be updated
          range = `${sheetName}!${columnLetter}${rowNumber}:${columnLetter}${rowNumber}`;

          const incomingValue = issue[key];
          const previousValue = mappedRowObject[key];

          //  compare with the value of the issue passed in the funciton
          if (incomingValue !== previousValue) {
            if (key === "title") {
              const hyperlink = `${PATH_PREFIX}/${issue.issueNumber}`;
              const cellContent = `=HYPERLINK("${hyperlink}", "${incomingValue}")`;
              values[0].push(cellContent);
              continue;
            }

            values[0].push(incomingValue);
          } else {
            continue;
          }
          data.push({ range, values });
        }
      } else {
        // if not present --> add the issue in a new row
        loopObjectKeysAndFillUpData(issue, numberOfRowsInSheet, range, data);
        numberOfRowsInSheet++;
      }
    }
    return data;
  } catch (error) {
    console.log("error in spreadsheetFiller addOrUpdateSpreadsheet", error);
  }
};

const loopObjectKeysAndFillUpData = (
  issue,
  numberOfRowsInSheet,
  range,
  data
) => {
  for (const key of Object.keys(issue)) {
    const values = [[]];
    let cellContent = issue[key];
    if (key === "title") {
      const hyperlink = `${PATH_PREFIX}/${issue.issueNumber}`;
      cellContent = `=HYPERLINK("${hyperlink}", "${issue[key]}")`;
    }
    const columnLetter = COLUMN_MAPPING.find(
      (item) => item.id === key
    ).columnLetter;
    range = `${sheetName}!${columnLetter}${
      numberOfRowsInSheet + 1
    }:${columnLetter}${numberOfRowsInSheet + 1}`;
    values[0].push(cellContent);
    data.push({ range, values });
  }
};

/**
 * @param {Object} credentials The authorization client credentials.
 */
const authorizeAndRun = async (credentials) => {
  const jwtAuth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    keyId: credentials.private_key_id,
    scopes: SCOPES,
  });
  return jwtAuth;
};

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
