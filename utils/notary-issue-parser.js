const { parseNotaryAddress } = require('./notary-parser-functions/parseNotaryAddress')
const { parseNotaryLedgerVerifiedComment } = require('./notary-parser-functions/parseNotaryLedgerVerifiedComment')
const { parseApproveComment } = require('./notary-parser-functions/parseApproveComment')
const { parseMultipleApproveComment } = require('./notary-parser-functions/parseMultipleApproveComment')
const { parseIssue } = require('./notary-parser-functions/parseIssue')

exports.parseIssue = parseIssue
exports.parseApproveComment = parseApproveComment
exports.parseMultipleApproveComment = parseMultipleApproveComment
exports.parseNotaryLedgerVerifiedComment = parseNotaryLedgerVerifiedComment
exports.parseNotaryAddress = parseNotaryAddress
