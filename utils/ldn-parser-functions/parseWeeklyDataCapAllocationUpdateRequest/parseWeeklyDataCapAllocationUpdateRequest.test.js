/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseWeeklyDataCapAllocationUpdateRequest } from '.'
const __dirname = path.resolve()

describe('parseWeeklyDataCapAllocationUpdateRequest()', () => {
    it('we can parse dataCap allocation updates requests', () => {
        const commentContent = readFileSync(
            resolve(__dirname, 'samples/utils/weekly_datacap_update_request.test.md'),
            { encoding: 'utf8' },
        )

        const parsedResult = parseWeeklyDataCapAllocationUpdateRequest(commentContent)

        expect(parsedResult.multisigMessage).toBe(true)
        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.allocationDatacap).toBe('10TiB')
    })
})
