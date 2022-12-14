const {
  matchGroupLargeNotary,
  matchAll,
} = require('./common-utils')
const { parseApprovedRequestWithSignerAddress } = require('./ldn-parser-functions/parseApprovedRequestWithSignerAddress')
const { ldnv3TriggerCommentParser } = require('./ldn-parser-functions/ldnv3TriggerCommentParser')
const { parseIssue } = require('./ldn-parser-functions/parseIssue')
const { parseMultisigNotaryRequest } = require('./ldn-parser-functions/parseMultisigNotaryRequest')

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

module.exports = {
  parseIssue,
  parseMultisigNotaryRequest,
  parseNotaryConfirmation,
  parseReleaseRequest,
  parseWeeklyDataCapAllocationUpdateRequest,
  parseApprovedRequestWithSignerAddress,
  parseMultisigReconnectComment,
  ldnv3TriggerCommentParser,
}
