/* eslint-disable indent */
const { parseNewLdn } = require('./parseNewLdn')
const { parseOldLDN } = require('./parseOldLdn')

// ldn template parser
function parseIssue(issueContent) {
    const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

    if (trimmed.startsWith('### Data Owner Name')) { return parseNewLdn(trimmed) }

    return parseOldLDN(issueContent)
}

exports.parseIssue = parseIssue
