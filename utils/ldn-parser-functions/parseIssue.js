/* eslint-disable indent */
import { parseNewLdn } from './parseNewLdn/index'
import { parseOldLDN } from './parseOldLDN/index'

// ldn template parser
export function parseIssue(issueContent) {
    const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

    if (trimmed.startsWith('### Data Owner Name')) { return parseNewLdn(trimmed) }

    return parseOldLDN(issueContent)
}
