const fs = require('fs')
const path = require('path')
const { parseApproveComment } = require('.')

describe('parseApproved()', () => {
  it.only('we can parse an approve comment including the right data', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/notary_approved_comment.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseApproveComment(commentContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.approvedMessage).toBe(true)
    expect(parsedResult.datacap).toBe('5PiB')
    expect(parsedResult.address).toBe('f1111222333')
  })
})
