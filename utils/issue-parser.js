const {
  matchGroup
} = require('./common-utils')

function parseIssue(issueContent) {
  const regexName = /[\n\r][ \t]*-\s*Name:[ \t]*([^\n\r]*)/m
  const regexAddress = /[\n\r][ \t]*-\s*Addresses\s*to\s*be\s*Notarized:[ \t]*([^\n\r]*)/m
  const regexDatacap = /[\n\r][ \t]*-\s*DataCap\s*Requested:[ \t]*([^\n\r]*)/m
  const regexWebsite = /[\n\r][ \t]*-\s*Website\s*\/\s*Social\s*Media:[ \t]*([^\n\r]*)/m
  const regexNotary = /[\n\r][ \t]*-\s*Notary\s*Requested:[ \t]*([^\n\r]*)/m
  const regexRegion = /[\n\r][ \t]*-\s*Region:[ \t]*([^\n\r]*)/m

  const name = matchGroup(regexName, issueContent)
  const address = matchGroup(regexAddress, issueContent)
  const datacap = matchGroup(regexDatacap, issueContent)
  const website = matchGroup(regexWebsite, issueContent)
  const notary = matchGroup(regexNotary, issueContent)
  const region = matchGroup(regexRegion, issueContent)


  if (name && address && datacap && website ) {
    return {
      correct: true,
      errorMessage: '',
      errorDetails: '',
      name: name,
      address: address,
      datacap: datacap,
      website: website,
      notary: notary,
      region: region,
    }
  }

  let errorMessage = ''
  if (!name) { errorMessage += 'We could not find your **Name** in the information provided\n' }
  if (!address) { errorMessage += 'We could not find your **Filecoin address** in the information provided\n' }
  if (!datacap) { errorMessage += 'We could not find the **Datacap** requested in the information provided\n' }
  if (!website) { errorMessage += 'We could not find any **website /social media** in the information provided\n' }

  return {
    correct: false,
    errorMessage: errorMessage,
    errorDetails: `Unable to find required attributes.
      The name= ${name},
      address= ${address},
      datacap= ${datacap},
      website= ${website}`,
  }
}

// function matchGroup(regex, content) {
//   let m
//   if ((m = regex.exec(content)) !== null) {
//     if (m.length >= 1) { return m[1].trim() }
//   }
// }

exports.parseIssue = parseIssue
