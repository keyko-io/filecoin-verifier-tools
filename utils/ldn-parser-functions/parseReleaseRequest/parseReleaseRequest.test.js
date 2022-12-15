/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseReleaseRequest } = require('.')

describe('parseReleaseRequest()', () => {
    it('we can parse dataCap allocation requests', () => {
        const commentContent = fs.readFileSync(
            path.resolve(__dirname, '../../../samples/utils/datacap_allocation_requested.test.md'),
            { encoding: 'utf8' },
        )
        const parsedResult = parseReleaseRequest(commentContent)

        expect(parsedResult.multisigMessage).toBe(true)
        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.notaryAddress).toBe('f01105812')
        expect(parsedResult.clientAddress).toBe('f3vnq2cmwig3qjisnx5hobxvsd4drn4f54xfxnv4tciw6vnjdsf5xipgafreprh5riwmgtcirpcdmi3urbg36a')
        expect(parsedResult.allocationDatacap).toBe('10TiB')
        expect(parsedResult.allocationDataCapAmount[0]).toBe('10TiB')
    })
})
