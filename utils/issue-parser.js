
function parseIssue(issueContent) {
  const regexName = /-\s*Name:\s*(.*)/m
  const regexAddress = /-\s*Addresses\s*to\s*be\s*Notarized:\s*(.*)/m
  const regexDatacap = /-\s*DataCap\s*Requested:\s*(.*)/m
  const regexWebsite = /-\s*Website\s*\/\s*Social\s*Media:\s*(.*)/m

  const name = matchGroup(regexName, issueContent)
  const address = matchGroup(regexAddress, issueContent)
  const datacap = matchGroup(regexDatacap, issueContent)
  const website = matchGroup(regexWebsite, issueContent)

  if (name != null && address != null && datacap != null && website != null) {
    return {
      correct: true,
      errorMessage: '',
      errorDetails: '',
      name: name,
      address: address,
      datacap: datacap,
      website: website,
    }
  }

  let errorMessage = ''
  if (name == null) { errorMessage += 'We could not find your **Name** in the information provided\n' }
  if (address == null) { errorMessage += 'We could not find your **Filecoin address** in the information provided\n' }
  if (datacap == null) { errorMessage += 'We could not find the **Datacap** requested in the information provided\n' }
  if (website == null) { errorMessage += 'We could not find any **website /social media** in the information provided\n' }

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

function matchGroup(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 1) { return m[1] }
  }
}

exports.parseIssue = parseIssue
