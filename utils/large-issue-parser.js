
function parseIssue(issueContent, issueTitle = '') {
  const regexName = /-\s*Organization\s*Name:\s*(.*)/m
  const regexWebsite = /-\s*Website\s*\/\s*Social\s*Media:\s*(.*)/m
  const regexAddress = /-\s*On-chain\s*Address\(es\)\s*to\s*be\s*Notarized:\s*(.*)/m
  const regexDatacapRequested = /-\s*DataCap\s*Requested:\s*(.*)/m

  const regextRemovalTitle = /\s*Large\s*Client\s*Request\s*DataCap\s*Removal:\s*(.*)/m

  const name = matchGroup(regexName, issueContent)
  const website = matchGroup(regexWebsite, issueContent)
  const address = matchGroup(regexAddress, issueContent)
  const datacapRequested = matchGroup(regexDatacapRequested, issueContent)

  if (name != null && address != null && datacapRequested != null && website != null) {
    return {
      correct: true,
      errorMessage: '',
      errorDetails: '',
      name: name,
      address: address,
      datacapRequested: datacapRequested,
      website: website,
      datacapRemoval: false,
    }
  }

  if (issueTitle !== '') {
    const removalAddress = matchGroup(regextRemovalTitle, issueTitle)
    if (removalAddress != null) {
      return {
        correct: true,
        errorMessage: '',
        errorDetails: '',
        name: '',
        address: removalAddress,
        datacapRequested: '0B',
        website: '',
        datacapRemoval: true,
      }
    }
  }

  let errorMessage = ''
  if (name == null) { errorMessage += 'We could not find your **Name** in the information provided\n' }
  if (address == null) { errorMessage += 'We could not find your **Filecoin address** in the information provided\n' }
  if (datacapRequested == null) { errorMessage += 'We could not find the **Datacap** requested in the information provided\n' }
  if (website == null) { errorMessage += 'We could not find any **Web site or social media info** in the information provided\n' }

  return {
    correct: false,
    errorMessage: errorMessage,
    errorDetails: `Unable to find required attributes.
        The name= ${name},
        address= ${address},
        datacapRequested= ${datacapRequested},
        website= ${website}`,
  }
}

function matchGroup(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 2) {
      return m[1]
    }
    return m[0]
  }
}

function parseApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*Approved/m
  const regexAddress = /####\s*Address\W*^>\s*(.*)/m
  const regexDatacap = /####\s*Datacap\s*Allocated\W*^>\s*(.*)/m

  const approved = matchGroup(regexApproved, commentContent)

  if (approved == null) {
    return {
      approvedMessage: false,
    }
  }

  const address = matchGroup(regexAddress, commentContent)
  const datacap = matchGroup(regexDatacap, commentContent)

  if (address != null && datacap != null) {
    return {
      approvedMessage: true,
      correct: true,
      address: address,
      datacap: datacap,
    }
  }

  let errorMessage = ''
  if (address == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacap == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: `Unable to find required attributes.
          The address= ${address},
          datacapAllocated= ${datacap}`,
  }
}

function matchAll(regex, content) {
  var matches = [...content.matchAll(regex)]
  if (matches !== null) {
    // each entry in the array has this form: Array ["#### Address > f1111222333", "", "f1111222333"]
    return matches.map(elem => elem[2])
  }
}

function parseMultipleApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*Approved/m
  const regexAddress = /####\s*Address\s*(.*)\n>\s*(.*)/g
  const regexDatacap = /####\s*Datacap\s*Allocated\s*(.*)\n>\s*(.*)/g

  const approved = matchGroup(regexApproved, commentContent)

  if (approved == null) {
    return {
      approvedMessage: false,
    }
  }

  const datacaps = matchAll(regexDatacap, commentContent)
  const addresses = matchAll(regexAddress, commentContent)

  if (addresses != null && datacaps != null) {
    return {
      approvedMessage: true,
      correct: true,
      addresses: addresses,
      datacaps: datacaps,
    }
  }

  let errorMessage = ''
  if (addresses == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacaps == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseMultisigNotaryRequest(commentContent) {
  const regexMultisig = /##\s*Multisig\s*Notary\s*requested/m
  const regexAddresses = /(?<=>\s).*\n(?=[\s\S]*####\sTotal\sDataCap\srequested)/gm
  const regexTotalDatacap = /####\s*Total\s*DataCap\s*requested\s*(.*)\n>\s*(.*)/g
  const regexWeeklyDatacap = /####\s*Expected\s*weekly\s*DataCap\s*usage\s*rate\s*(.*)\n>\s*(.*)/g

  const multisig = matchGroup(regexMultisig, commentContent)

  if (multisig == null) {
    return {
      multisigMessage: false,
    }
  }

  const addresses = matchAll(regexAddresses, commentContent)
  const totalDatacaps = matchAll(regexTotalDatacap, commentContent)
  const weeklyDatacap = matchAll(regexWeeklyDatacap, commentContent)
  
  if (addresses != null && totalDatacaps != null && weeklyDatacap) {
    return {
      multisigMessage: true,
      correct: true,
      addresses: addresses,
      totalDatacaps: totalDatacaps,
      weeklyDatacap: weeklyDatacap
    }
  }

  let errorMessage = ''
  if (addresses == null) { errorMessage += 'We could not find the **Filecoin addresses** in the information provided in the comment\n' }
  if (totalDatacaps == null) { errorMessage += 'We could not find the **Total Datacap** allocated in the information provided in the comment\n' }
  if (weeklyDatacap == null) { errorMessage += 'We could not find the **Weekly Datacap** allocated in the information provided in the comment\n' }
  return {
    multisigMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

exports.parseIssue = parseIssue
exports.parseApproveComment = parseApproveComment
exports.parseMultipleApproveComment = parseMultipleApproveComment
exports.parseMultisigNotaryRequest = parseMultisigNotaryRequest
