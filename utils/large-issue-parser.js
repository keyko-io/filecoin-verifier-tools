const {
  matchGroupLargeNotary,
  matchAll,
  validateIssueDataCap,
} = require('./common-utils')

function parseIssue(issueContent, issueTitle = '') {
  const regexName = /[\n\r][ \t]*-\s*Organization\s*Name:[ \t]*([^\n\r]*)/
  const regexWebsite = /[\n\r][ \t]*-\s*Website\s*\/\s*Social\s*Media:[ \t]*([^\n\r]*)/m
  const regexAddress = /[\n\r][ \t]*-\s*On-chain\s*address\s*for\s*first\s*allocation:[ \t]*([^\n\r]*)/m
  const regexDatacapRequested = /[\n\r][ \t]*-\s*Total\s*amount\s*of\s*DataCap\s*being\s*requested\s*\(between 500 TiB and 5 PiB\)\s*:[ \t]*([^\n\r]*)/m
  const regextRemovalTitle = /#\s*Large\s*Client\s*Request\s*DataCap\s*Removal:[ \t]*([^\n\r]*)/m
  const regexWeeklyDataCapAllocation = /[\n\r][ \t]*-\s*Weekly\s*allocation\s*of\s*DataCap\s*requested\s*\(usually between 1-100TiB\)\s*:[ \t]*([^\n\r]*)/m

  const name = matchGroupLargeNotary(regexName, issueContent)
  const website = matchGroupLargeNotary(regexWebsite, issueContent)
  const address = matchGroupLargeNotary(regexAddress, issueContent)
  const datacapRequested = matchGroupLargeNotary(regexDatacapRequested, issueContent)
  const dataCapWeeklyAllocation = matchGroupLargeNotary(regexWeeklyDataCapAllocation, issueContent)

  const validateIssueDataCapResult = validateIssueDataCap(datacapRequested, dataCapWeeklyAllocation)

  if (name && address && datacapRequested && website && dataCapWeeklyAllocation && validateIssueDataCapResult.resultCorrectDc && validateIssueDataCapResult.resultCorrectWeeklyDc) {
    return {
      correct: true,
      errorMessage: '',
      errorDetails: '',
      name: name,
      address: address,
      datacapRequested: datacapRequested,
      dataCapWeeklyAllocation: dataCapWeeklyAllocation,
      website: website,
      datacapRemoval: false,
    }
  }

  if (issueTitle !== '') {
    const removalAddress = matchGroupLargeNotary(regextRemovalTitle, issueContent)
    if (removalAddress) {
      return {
        correct: true,
        errorMessage: '',
        errorDetails: '',
        name: '',
        address: removalAddress,
        datacapRequested: '0B',
        dataCapWeeklyAllocation: '0B',
        website: '',
        datacapRemoval: true,
      }
    }
  }

  let errorMessage = ''
  if (!name) { errorMessage += 'We could not find your **Name** in the information provided\n' }
  if (!address) { errorMessage += 'We could not find your **Filecoin address** in the information provided\n' }
  if (!datacapRequested) { errorMessage += 'We could not find the **Datacap** requested in the information provided\n' }
  if (!website) { errorMessage += 'We could not find any **Web site or social media info** in the information provided\n' }
  if (!dataCapWeeklyAllocation) { errorMessage += 'We could not find any **Expected weekly DataCap usage rate** in the information provided\n' }
  if (!validateIssueDataCapResult.resultCorrectDc) { errorMessage += 'The formatting for the **Total amount of DataCap being requested** is wrong. please input again with this formatting : nnnTiB/PiB or nnnTiB/PiB \n' }
  if (!validateIssueDataCapResult.resultCorrectWeeklyDc) { errorMessage += 'The formatting for the **Weekly allocation of DataCap requested** is wrong. please input again with this formatting : nnnTiB/PiB or nnnTiB/PiB \n' }

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

// function matchGroup(regex, content) {
//   let m
//   if ((m = regex.exec(content)) !== null) {
//     if (m.length >= 2) {
//       return m[1].trim()
//     }
//     return m[0].trim()
//   }
// }

function parseApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*Approved/m
  const regexAddress = /####\s*Address\W*^>\s*(.*)/m
  const regexDatacap = /####\s*Datacap\s*Allocated\W*^>\s*(.*)/m

  const approved = matchGroupLargeNotary(regexApproved, commentContent)

  if (approved == null) {
    return {
      approvedMessage: false,
    }
  }

  const address = matchGroupLargeNotary(regexAddress, commentContent)
  const datacap = matchGroupLargeNotary(regexDatacap, commentContent)

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

// function matchAll(regex, content) {
//   var matches = [...content.matchAll(regex)]
//   if (matches !== null) {
//     // each entry in the array has this form: Array ["#### Address > f1111222333", "", "f1111222333"]
//     return matches.map(elem => elem[2])
//   }
// }

function parseMultipleApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*Approved/m
  const regexAddress = /####\s*Address\s*(.*)\n>\s*(.*)/g
  const regexDatacap = /####\s*Datacap\s*Allocated\s*(.*)\n>\s*(.*)/g

  const approved = matchGroupLargeNotary(regexApproved, commentContent)

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

function parseApprovedRequestWithSignerAddress(commentContent) {
  const regexApproved = /##\s*Request\s*Approved/m
  const regexAddress = /####\s*Address\W*^>\s*(.*)/m
  const regexDatacap = /####\s*Datacap\s*Allocated\W*^>\s*(.*)/m
  const regexSignerAddress = /####\s*Signer\s*Address\s*\n>\s*(.*)/g
  const regexMessage = /####\s*Message\s*sent\s*to\s*Filecoin\s*Network\s*\n>\s*(.*)/g

  const approved = matchGroupLargeNotary(regexApproved, commentContent)

  if (approved == null) {
    return {
      approvedMessage: false,
    }
  }

  const datacap = matchGroupLargeNotary(regexDatacap, commentContent)
  const address = matchGroupLargeNotary(regexAddress, commentContent)
  const signerAddress = matchGroupLargeNotary(regexSignerAddress, commentContent)
  const message = matchGroupLargeNotary(regexMessage, commentContent)

  if (address != null && datacap != null && signerAddress != null && message != null) {
    return {
      approvedMessage: true,
      correct: true,
      address: address,
      datacap: datacap,
      signerAddress: signerAddress,
      message: message,
    }
  }

  let errorMessage = ''
  if (address == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacap == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  if (signerAddress == null) { errorMessage += 'We could not find the **signerAddress** in the information provided in the comment\n' }
  if (message == null) { errorMessage += 'We could not find the **message** in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseMultisigNotaryRequest(commentContent) {
  const regexMultisig = /##\s*Multisig\s*Notary\s*requested/m
  const regexTotalDatacap = /####\s*Total\s*DataCap\s*requested\s*(.*)\n>\s*(.*)/g
  const regexWeeklyDatacap = /####\s*Expected\s*weekly\s*DataCap\s*usage\s*rate\s*(.*)\n>\s*(.*)/g

  const multisig = matchGroupLargeNotary(regexMultisig, commentContent)

  if (multisig == null) {
    return {
      multisigMessage: false,
    }
  }

  const totalDatacaps = matchAll(regexTotalDatacap, commentContent)
  const weeklyDatacap = matchAll(regexWeeklyDatacap, commentContent)

  if (totalDatacaps != null && weeklyDatacap) {
    return {
      multisigMessage: true,
      correct: true,
      totalDatacaps: totalDatacaps,
      weeklyDatacap: weeklyDatacap,
    }
  }

  let errorMessage = ''
  // if (addresses == null || addresses.length === 0) { errorMessage += 'We could not find the **Filecoin addresses** in the information provided in the comment\n' }
  if (totalDatacaps == null) { errorMessage += 'We could not find the **Total Datacap** allocated in the information provided in the comment\n' }
  if (weeklyDatacap == null) { errorMessage += 'We could not find the **Weekly Datacap** allocated in the information provided in the comment\n' }
  return {
    multisigMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseNotaryConfirmation(commentContent, title) {
  const regexConfirmation = /##\s*The\s*request\s*has\s*been\s*signed\s*by\s*a\s*new\s*Root\s*Key\s*Holder/m
  const regexTitleNumber = /Large\sdataset\smultisig\srequest\s#\s*([0-9]*)/m

  const confirmation = matchGroupLargeNotary(regexConfirmation, commentContent)
  const number = Number([...title.match(regexTitleNumber)][1])

  if (confirmation == null) {
    return {
      confirmationMessage: false,
    }
  } else {
    return {
      confirmationMessage: true,
      number: number,
    }
  }
}

function parseReleaseRequest(commentContent) {
  const regexMultisig = /##\s*DataCap\s*Allocation\s*requested/m
  const regexNotaryAddress = /####\s*Multisig\s*Notary\s*address\s*>\s*(.*)/g
  const regexClientAddress = /####\s*Client\s*address\s*>\s*(.*)/g
  const regexAllocationDatacap = /####\s*DataCap\s*allocation\s*requested\s*\n>\s*(.*)/g

  const multisig = matchGroupLargeNotary(regexMultisig, commentContent)

  if (multisig == null) {
    return {
      multisigMessage: false,
    }
  }

  const notaryAddress = matchGroupLargeNotary(regexNotaryAddress, commentContent)
  const clientAddress = matchGroupLargeNotary(regexClientAddress, commentContent)
  const allocationDatacap = matchGroupLargeNotary(regexAllocationDatacap, commentContent)

  if (notaryAddress != null && clientAddress != null && allocationDatacap != null) {
    return {
      multisigMessage: true,
      correct: true,
      notaryAddress: notaryAddress,
      clientAddress: clientAddress,
      allocationDatacap: allocationDatacap,
      allocationDataCapAmount: [allocationDatacap],
    }
  }

  let errorMessage = ''
  if (notaryAddress == null) { errorMessage += 'We could not find the **Filecoin notary address** in the information provided in the comment\n' }
  if (clientAddress == null) { errorMessage += 'We could not find the **Client address** in the information provided in the comment\n' }
  if (allocationDatacap == null) { errorMessage += 'We could not find the **Alocation datacap** in the information provided in the comment\n' }
  return {
    multisigMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseWeeklyDataCapAllocationUpdateRequest(commentContent) {
  const regexRequest = /##\s*Weekly\s*DataCap\s*Allocation\s*Update\s*requested/m
  const regexDataCap = /####\s*Update\s*to\s*expected\s*weekly\s*DataCap\s*usage\s*rate\s*>\s*(.*)/g

  const request = matchGroupLargeNotary(regexRequest, commentContent)
  if (request == null) {
    return {
      multisigMessage: false,
    }
  }

  const allocationDatacap = matchGroupLargeNotary(regexDataCap, commentContent)
  if (allocationDatacap != null) {
    return {
      multisigMessage: true,
      correct: true,
      allocationDatacap: allocationDatacap,
    }
  }

  let errorMessage = ''
  if (allocationDatacap == null) { errorMessage += 'We could not find the **Alocation datacap** in the information provided in the comment\n' }
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
exports.parseNotaryConfirmation = parseNotaryConfirmation
exports.parseReleaseRequest = parseReleaseRequest
exports.parseWeeklyDataCapAllocationUpdateRequest = parseWeeklyDataCapAllocationUpdateRequest
exports.parseApprovedRequestWithSignerAddress = parseApprovedRequestWithSignerAddress
