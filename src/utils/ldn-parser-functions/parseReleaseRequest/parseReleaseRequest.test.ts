/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseReleaseRequest } from '.'
const __dirname = path.resolve()

describe('parseReleaseRequest()', () => {
    it('we can parse dataCap allocation requests', () => {
        const commentContent = readFileSync(
            resolve(__dirname, 'src/samples/utils/datacap_allocation_requested.test.md'),
            { encoding: 'utf8' },
        )
        const parsedResult = parseReleaseRequest(commentContent)

        expect(parsedResult.multisigMessage).toBe(true)
        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.notaryAddress).toBe('f02049625')
        expect(parsedResult.clientAddress).toBe('f172zurpjgt6a7kgjoka5q3e375zakyihqw5uhdia')
        expect(parsedResult.allocationDatacap).toBe('400TiB')
        expect(parsedResult.allocationDataCapAmount[0]).toBe('400TiB')
        expect(parsedResult.uuid).toBe('aa486d00-1283-4a56-bff0-0d5dd49e762a')
    })
})
