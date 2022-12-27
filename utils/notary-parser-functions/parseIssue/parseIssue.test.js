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

  it('we can not parse an invalid issue', () => {
    const parsedResult = parseIssue('random string')
    expect(parsedResult.correct).toBe(false)
    expect(parsedResult.errorMessage).not.toBe('')
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

describe('parseRemovalIssue()', () => {
  it('we can parse an issue including the right data', () => {
    const issueContent = 'This is an issue to remove the DataCap associated with f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb.\nThis address was used by the Filecoin Foundation during the Filecoin Beta for allocations. Now that a new allocation has been made to a new address, this should be set to 0.'
    const issueTitle = 'Notary DataCap Removal: f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb'

    const parsedResult = parseIssue(issueContent, issueTitle)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.datacapRemoval).toBe(true)
    expect(parsedResult.address).toBe('f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb')
    expect(parsedResult.datacapRequested).toBe('0B')
  })
})
