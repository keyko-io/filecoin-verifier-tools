const fs = require('fs')
const path = require('path')
const { parseNotaryAddress } = require('.')

describe('parseNotaryAddress()', () => {
  it('we can parse the Notary address', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/notary_application.address.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseNotaryAddress(commentContent)

    expect(parsedResult).toBe('f3vo5gthuc4uvwsyfawcogkgj4vleghhzsbm7zrb3z7juq7zq7rpac5law6glof66emmhfqgl4xtbu42bbupea')
    // expect(parsedResult.messageCid).toBe('bafy2bzacedeu7ymgdg3gwy522gtoy4a6j6v433cur4wjlv2xjeqtvm4bkymoi')
  })
})
