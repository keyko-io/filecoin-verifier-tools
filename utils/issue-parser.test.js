var fs = require('fs')
var path = require('path')
const { parseIssue } = require('./issue-parser')

describe('parseIssue()', () => {
  it('we can parse an issue including the right data', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/client_allocation_request.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('Protocol Labs')
    expect(parsedResult.address).toBe('t0231874218')
    expect(parsedResult.datacap).toBe('10TiB')
    expect(parsedResult.website).toContain('https://protocol.ai/')
    expect(parsedResult.notary).toBe('notaryuser')
    expect(parsedResult.region).toBe('Europe')
  })

  it('we can not parse an invalid issue', () => {
    const parsedResult = parseIssue('random string')
    expect(parsedResult.correct).toBe(false)
    expect(parsedResult.errorMessage).not.toBe('')
  })

  it('empty issue get not validated', () => {
    const issueContentNoVals = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/client_application_no_values.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContentNoVals)
    expect(parsedResult.correct).toBe(false)
  })

  it('validate formatting of datacap', () => {
    const issueContentFormatDc = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/client_allocation_request_datacap_formatting.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContentFormatDc)
    expect(parsedResult.correct).toBe(false)
  })
})
