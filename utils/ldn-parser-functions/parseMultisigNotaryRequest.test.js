/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseMultisigNotaryRequest } = require('./parseMultisigNotaryRequest')

describe('parseMultisigNotaryRequest()', () => {
    it('we can parse dataCap allocation requests', () => {
        const commentContent = fs.readFileSync(
            path.resolve(__dirname, '../.././samples/utils/multising_notary_requested.test.md'),
            { encoding: 'utf8' },
        )
        const parsedResult = parseMultisigNotaryRequest(commentContent)

        expect(parsedResult.multisigMessage).toBe(true)
        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.totalDatacaps).toBe('5PiB')
        expect(parsedResult.weeklyDatacap).toBe('500TiB')
    })
})
