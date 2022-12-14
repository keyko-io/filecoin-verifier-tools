/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseMultisigReconnectComment } = require('.')

describe('parseMultisigReconnectComment()', () => {
    it('we can parse reconnection request', () => {
        const commentContent = fs.readFileSync(
            path.resolve(__dirname, '../../../samples/utils/issue_reconnection_requested.test.md'),
            { encoding: 'utf8' },
        )

        const parsedResult = parseMultisigReconnectComment(commentContent)

        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.msigAddress).toBe('f01105812')
        expect(parsedResult.issueURI).toBe('https://github.com/keyko-io/filecoin-notaries-onboarding/issues/370')
    })
})
