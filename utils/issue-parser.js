
function parseIssue(issueContent) {
  const regexName = /\s*Organization\sName\W*^>\s*(.*)/m
  const regexAddress = /###\s*Address\W*^>\s*(.*)/m
  const regexDatacap = /###\s*Datacap\sRequested\W*^>\s*(.*)/m
  const regexInfo = /##\s*Additional\sInformation([\s\S]*)##\sDisclaimer/gm

  const name = matchGroup(regexName, issueContent)
  const address = matchGroup(regexAddress, issueContent)
  const datacap = matchGroup(regexDatacap, issueContent)
  const additionalInfo = matchGroup(regexInfo, issueContent)

  if (name != null && address != null && datacap != null && additionalInfo != null) {
    return {
      correct: true,
      errorMessage: '',
      errorDetails: '',
      name: name,
      address: address,
      datacap: datacap,
      additionalInformation: additionalInfo,
    }
  }

  let errorMessage = ''
  if (name == null) { errorMessage += 'We could not find your **Name** in the information provided\n' }
  if (address == null) { errorMessage += 'We could not find your **Filecoin address** in the information provided\n' }
  if (datacap == null) { errorMessage += 'We could not find the **Datacap** requested in the information provided\n' }
  if (additionalInfo == null) { errorMessage += 'We could not find any **additionalInformation** in the information provided\n' }

  return {
    correct: false,
    errorMessage: errorMessage,
    errorDetails: `Unable to find required attributes.
      The name= ${name},
      address= ${address},
      datacap= ${datacap},
      additionalInformation= ${additionalInfo}`,
  }
}

function matchGroup(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 1) { return m[1] }
  }
}

exports.parseIssue = parseIssue
