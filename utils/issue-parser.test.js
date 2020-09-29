var fs = require('fs')
var path = require('path')
const { parseIssue } = require('./issue-parser')

describe('parseIssue()', () => {
  it('we can parse an issue including the right data', () => {

    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/datacap_request.test.md'),
      { encoding: 'utf8' }
    )
    const parsedResult = parseIssue(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('Protocol Labs')
    expect(parsedResult.address).toBe('t0231874218')
    expect(parsedResult.datacap).toBe('10TB')
    expect(parsedResult.additionalInformation).toContain('Is there any other information you can provide')
  })

  it('we can not parse an invalid issue', () => {
    const parsedResult = parseIssue('random string')
    expect(parsedResult.correct).toBe(false)
    expect(parsedResult.errorMessage).not.toBe('')
  })
})
