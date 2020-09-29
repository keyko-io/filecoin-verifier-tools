

function parseIssue(issueContent)  {
  const regexName = /###\s*Organization\sName\n\n^>\s*(.*)/m
  const regexAddress = /###\s*Address\n\n^>\s*(.*)/m
  const regexDatacap = /###\s*Datacap\sRequested\n\n^>\s*(.*)/m
  const regexInfo = /##\s*Additional\sInformation([\s\S]*)##\sDisclaimer/gm

  const name = matchGroup(regexName, issueContent)
  const address = matchGroup(regexAddress, issueContent)
  const datacap = matchGroup(regexDatacap, issueContent)
  const additionalInfo = matchGroup(regexInfo, issueContent)

  if (name != null && address != null && datacap != null && additionalInfo != null)
    return {
      correct: true,
      errorMessage: '',
      name: name,
      address: address,
      datacap: datacap,
      additionalInformation: additionalInfo
    }

  return {
    correct: false,
    errorMessage: `Unable to find required attributes.
      Found: name= ${name},
      address= ${address},
      datacap= ${datacap},
      additionalInformation= ${additionalInfo}`
  }
}



function matchGroup(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
      if (m.length >=1)
        return m[1]
  }
  return
}


exports.parseIssue = parseIssue
