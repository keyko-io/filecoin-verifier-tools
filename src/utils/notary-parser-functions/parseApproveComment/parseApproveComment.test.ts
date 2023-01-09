import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseApproveComment } from '.'
const __dirname = path.resolve()

describe('parseApproved()', () => {
  it('we can parse an approve comment including the right data', () => {
    const commentContent = readFileSync(
      resolve(__dirname, 'samples/utils/notary_approved_comment.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseApproveComment(commentContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.approvedMessage).toBe(true)
    expect(parsedResult.datacap).toBe('5PiB')
    expect(parsedResult.address).toBe('f1111222333')
  })
})
