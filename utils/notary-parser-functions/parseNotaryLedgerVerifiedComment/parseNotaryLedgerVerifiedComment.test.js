const fs = require('fs')
const path = require('path')
const { parseNotaryLedgerVerifiedComment } = require('.')

describe('parseNotaryLedgerVerifiedComment()', () => {
  it('we can parse the Notary Ledger Verified comment', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/notary_ledger_verified_comment.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseNotaryLedgerVerifiedComment(commentContent)

    expect(parsedResult.correct).toBe(true)
    // expect(parsedResult.messageCid).toBe('bafy2bzacedeu7ymgdg3gwy522gtoy4a6j6v433cur4wjlv2xjeqtvm4bkymoi')
  })
})