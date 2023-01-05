/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseMultisigNotaryRequest } from '.'
const __dirname = path.resolve()

describe('parseMultisigNotaryRequest()', () => {
    it('we can parse dataCap allocation requests', () => {
        const commentContent = readFileSync(
            resolve(__dirname, 'samples/utils/multising_notary_requested.test.md'),
            { encoding: 'utf8' },
        )
        const parsedResult = parseMultisigNotaryRequest(commentContent)

        expect(parsedResult.multisigMessage).toBe(true)
        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.totalDatacaps).toBe('5PiB')
        expect(parsedResult.weeklyDatacap).toBe('500TiB')
    })
})
