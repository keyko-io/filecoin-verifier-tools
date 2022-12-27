const { matchGroupLargeNotary } = require('../../common-utils')

function parseNotaryLedgerVerifiedComment(commentContent) {
  const regexVerified = /##\s*Notary\s*Ledger\s*Verified/m
  // const regexMessageCid = />\s*Message\s*CID:\s*(.*)/m

  const verified = matchGroupLargeNotary(regexVerified, commentContent)

  // const messageCid = matchGroupLargeNotary(regexMessageCid, commentContent)

  if (verified) {
    return {
      correct: true,
      // messageCid: messageCid,
    }
  }

  let errorMessage = ''
  if (!verified) { errorMessage += 'The issue is not verified\n' }
  // if (!messageCid) { errorMessage += 'Message CID not found in the comment\n' }
  return {
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

exports.parseNotaryLedgerVerifiedComment = parseNotaryLedgerVerifiedComment
