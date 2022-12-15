/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseWeeklyDataCapAllocationUpdateRequest } = require('.')

describe('parseWeeklyDataCapAllocationUpdateRequest()', () => {
    it('we can parse dataCap allocation updates requests', () => {
        const commentContent = fs.readFileSync(
            path.resolve(__dirname, '../../../samples/utils/weekly_datacap_update_request.test.md'),
            { encoding: 'utf8' },
        )

        const parsedResult = parseWeeklyDataCapAllocationUpdateRequest(commentContent)

        expect(parsedResult.multisigMessage).toBe(true)
        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.allocationDatacap).toBe('10TiB')
    })
})
