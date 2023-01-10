/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseNotaryConfirmation } from '.'
const __dirname = path.resolve()

describe('parseNotaryConfirmation()', () => {
    const commentContent = readFileSync(
        resolve(__dirname, 'src/samples/utils/notary_confirmation.test.md'),
        { encoding: 'utf8' },

    )
    const title = 'Large dataset multisig request #12345'

    it('we can parse notary confirmation message and number of title', () => {
        const parsedResult = parseNotaryConfirmation(commentContent, title)

        expect(parsedResult.confirmationMessage).toBe(true)
        expect(parsedResult.number).toBe(12345)
    })
})

describe('parseNotaryConfirmation()', () => {
    const commentContent = ''
    const title = ''

    it('we should get error and false confirmation message info', () => {
        const parsedResult = parseNotaryConfirmation(commentContent, title)

        expect(parsedResult.confirmationMessage).toBe(false)
        expect(parsedResult.errorMessage).not.toBe('')
    })
})
