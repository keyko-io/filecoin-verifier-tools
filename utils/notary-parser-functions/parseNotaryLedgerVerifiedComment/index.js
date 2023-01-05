import { matchGroupLargeNotary } from '../../common-utils'

export function parseNotaryLedgerVerifiedComment(commentContent) {
  const regexVerified = /##\s*Notary\s*Ledger\s*Verified/m

  const verified = matchGroupLargeNotary(regexVerified, commentContent)

  if (verified) {
    return {
      correct: true,
    }
  }

  let errorMessage = ''
  if (!verified) { errorMessage += 'The issue is not verified\n' }

  return {
    correct: false,
    errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}
