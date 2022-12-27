const { matchGroupLargeNotary, matchAll } = require('../../common-utils')

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

exports.parseMultipleApproveComment = parseMultipleApproveComment
