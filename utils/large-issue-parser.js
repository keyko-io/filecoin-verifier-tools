const {
  matchGroupLargeNotary,
  matchAll,
} = require('./common-utils')
const { parseTrimmedIssue } = require('./helpers/new-ldn-parser')
const { parseOldLDN } = require('./helpers/old-ldn-parser')

function parseIssue(issueContent) {
  const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

  if (trimmed.startsWith('### Data Owner Name')) { return parseTrimmedIssue(trimmed) }

  return parseOldLDN(issueContent)
}

function parseApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*((Approved)|(Proposed))/m
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

function parseMultipleApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*((Approved)|(Proposed))/m
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
  const regexApproved = /##\s*Request\s*((Approved)|(Proposed))/m
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

function ldnv3TriggerCommentParser(commentBody) {
  const regexTrigger = /##\s*datacap\s*request\s*trigger/mi

  const regexTotalDatacap = /####\s*Total\s*DataCap\s*requested\s*(.*)\n>\s*(.*)/g
  const regexWeeklyDatacap = /####\s*Expected\s*weekly\s*DataCap\s*usage\s*rate\s*(.*)\n>\s*(.*)/g
  // const regexClientAddress = /####\s*Client\s*address\s*(.*)\n>\s*(.*)/g

  const totalDatacap = matchAll(regexTotalDatacap, commentBody)
  const weeklyDatacap = matchAll(regexWeeklyDatacap, commentBody)

  const triggerMessageMatch = regexTrigger.test(commentBody)

  if (!triggerMessageMatch) {
    return {
      triggerMessage: false,
    }
  }

  if (totalDatacap && weeklyDatacap) {
    return {
      correct: true,
      totalDatacap: totalDatacap[0],
      weeklyDatacap: weeklyDatacap[0],
    }
  }

  let errorMessage = ''
  // if (addresses == null || addresses.length === 0) { errorMessage += 'We could not find the **Filecoin addresses** in the information provided in the comment\n' }
  if (totalDatacap == null) { errorMessage += 'We could not find the **Total Datacap** allocated in the information provided in the comment\n' }
  if (weeklyDatacap == null) { errorMessage += 'We could not find the **Weekly Datacap** allocated in the information provided in the comment\n' }
  return {
    correct: false,
    errorMessage,
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

function parseMultisigReconnectComment(commentContent) {
  const regexRequest = /##\s*Multisig\s*Notary\s*Reconnection\s*Request/m
  const regexMsigAddress = /####\s*Multisig\s*Notary\s*Address\s*(.*)\n>\s*(.*)/g
  const regexClientAddress = /####\s*Client\s*Address\s*(.*)\n>\s*(.*)/g
  const regexIssue = /####\s*Notary\s*Governance\s*Issue\s*(.*)\n>\s*(.*)/g

  const requestType = matchGroupLargeNotary(regexRequest, commentContent)
  const msigAddress = matchAll(regexMsigAddress, commentContent)[0]
  const clientAddress = matchAll(regexClientAddress, commentContent)[0]
  const issueURI = matchAll(regexIssue, commentContent)[0]

  if (requestType && msigAddress && issueURI) {
    return {
      correct: true,
      msigAddress,
      clientAddress,
      issueURI,
    }
  }

  let errorMessage = ''
  if (msigAddress == null) { errorMessage += 'We could not find the **Multisig Notary Address** allocated in the information provided in the comment\n' }
  if (clientAddress == null) { errorMessage += 'We could not find the **Client Address** allocated in the information provided in the comment\n' }
  if (issueURI == null) { errorMessage += 'We could not find the **Notary Governance Issue** allocated in the information provided in the comment\n' }
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
exports.parseMultisigReconnectComment = parseMultisigReconnectComment
exports.ldnv3TriggerCommentParser = ldnv3TriggerCommentParser
