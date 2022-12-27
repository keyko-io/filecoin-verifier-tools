const fs = require('fs')
const path = require('path')
const { parseMultipleApproveComment } = require('.')

describe('parseApprovedMultiple()', () => {
  it('we can parse an approve comment including the right data', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/notary_approved_comment.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseMultipleApproveComment(commentContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.approvedMessage).toBe(true)
    expect(parsedResult.addresses[0]).toBe('f1111222333')
    expect(parsedResult.datacaps[0]).toBe('5TiB')
    expect(parsedResult.addresses[1]).toBe('f33332222111')
    expect(parsedResult.datacaps[1]).toBe('1TiB')
    expect(parsedResult.addresses[2]).toBe('f222233334444')
    expect(parsedResult.datacaps[2]).toBe('10TiB')
  })
})
