/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseNotaryConfirmation } = require('.')

describe('parseNotaryConfirmation()', () => {
    const commentContent = fs.readFileSync(
        path.resolve(__dirname, '../../../samples/utils/notary_confirmation.test.md'),
        { encoding: 'utf8' },

    )
    const title = 'Large dataset multisig request #12345'

    it('we can parse notary confirmation message and number of title', () => {
        const parsedResult = parseNotaryConfirmation(commentContent, title)
        expect(parsedResult.confirmationMessage).toBe(true)
        expect(parsedResult.number).toBe(12345)
    })
    it('we cannnot parse a null confirmation', () => {
        const parsedResult = parseNotaryConfirmation(null, title)
        expect(parsedResult.confirmationMessage).toBe(false)
    })
})
