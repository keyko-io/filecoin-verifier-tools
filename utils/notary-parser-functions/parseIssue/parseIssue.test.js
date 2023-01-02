var fs = require('fs')
var path = require('path')
const { parseIssue } = require('.')

describe('parseIssue()', () => {
  it('we can parse an issue including the right data', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/notary_application_new_temp.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('JLow Cen')
    expect(parsedResult.organization).toBe('XXX Technologies Limited')
    expect(parsedResult.address).toBe('f3qkxwggmup3troacakwz6u6f3u2cytfp5rkf3qxtksbruoffahyhd37krbosa4j2oywzql3vyqdvyu2skkasd')
    expect(parsedResult.region).toBe('Greater China Region')
    expect(parsedResult.country).toBe('Greater China Region')
    expect(parsedResult.useCases).toBe('General')
    expect(parsedResult.datacapRequested).toBe('1PiB')
    expect(parsedResult.behalf).toBe('Organization')
  })
})

describe('parseIssue()', () => {
  it('should parse the amount of datacap request correctly', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/notary_application_new_temp.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContent)

    expect(parsedResult.datacapRequested).toBe('1PiB')
  })
})
