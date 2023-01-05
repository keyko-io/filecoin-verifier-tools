/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseReleaseRequest } from '.'
const __dirname = path.resolve()

describe('parseReleaseRequest()', () => {
    it('we can parse dataCap allocation requests', () => {
        const commentContent = readFileSync(
            resolve(__dirname, 'samples/utils/datacap_allocation_requested.test.md'),
            { encoding: 'utf8' },
        )
        const parsedResult = parseReleaseRequest(commentContent)

        expect(parsedResult.multisigMessage).toBe(true)
        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.notaryAddress).toBe('f01105812')
        expect(parsedResult.clientAddress).toBe('f3vnq2cmwig3qjisnx5hobxvsd4drn4f54xfxnv4tciw6vnjdsf5xipgafreprh5riwmgtcirpcdmi3urbg36a')
        expect(parsedResult.allocationDatacap).toBe('10TiB')
        expect(parsedResult.allocationDataCapAmount[0]).toBe('10TiB')
        expect(parsedResult.uuid).toBe('6bbdae0f-c6fc-498f-a587-cb6a534d99a2')
    })
})
