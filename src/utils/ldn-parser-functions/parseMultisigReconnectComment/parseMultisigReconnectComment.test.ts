/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseMultisigReconnectComment } from '.'
const __dirname = path.resolve()

describe('parseMultisigReconnectComment()', () => {
    it('we can parse reconnection request', () => {
        const commentContent = readFileSync(
            resolve(__dirname, 'src/samples/utils/issue_reconnection_requested.test.md'),
            { encoding: 'utf8' },
        )

        const parsedResult = parseMultisigReconnectComment(commentContent)

        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.msigAddress).toBe('f01105812')
        expect(parsedResult.issueURI).toBe('https://github.com/keyko-io/filecoin-notaries-onboarding/issues/370')
    })
})
