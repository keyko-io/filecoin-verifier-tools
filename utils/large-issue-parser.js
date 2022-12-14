const {
  matchGroupLargeNotary,
} = require('./common-utils')
const { parseApprovedRequestWithSignerAddress } = require('./ldn-parser-functions/parseApprovedRequestWithSignerAddress')
const { ldnv3TriggerCommentParser } = require('./ldn-parser-functions/ldnv3TriggerCommentParser')
const { parseIssue } = require('./ldn-parser-functions/parseIssue')
const { parseMultisigNotaryRequest } = require('./ldn-parser-functions/parseMultisigNotaryRequest')
const { parseMultisigReconnectComment } = require('./ldn-parser-functions/parseMultisigReconnectComment')
const { parseNotaryConfirmation } = require('./ldn-parser-functions/parseNotaryConfirmation')

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
