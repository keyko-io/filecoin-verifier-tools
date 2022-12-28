const { matchGroupLargeNotary } = require('../../common-utils')

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

exports.parseApproveComment = parseApproveComment
