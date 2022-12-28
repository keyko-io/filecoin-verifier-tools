const { parseNotaryAddress } = require('./notary-parser-functions/parseNotaryAddress')
const { parseNotaryLedgerVerifiedComment } = require('./notary-parser-functions/parseNotaryLedgerVerifiedComment')
const { parseApproveComment } = require('./notary-parser-functions/parseApproveComment')
const { parseIssue } = require('./notary-parser-functions/parseIssue')

module.exports = {
  parseIssue,
  parseApproveComment,
  parseNotaryLedgerVerifiedComment,
  parseNotaryAddress,
}
