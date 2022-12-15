/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseOldLDN } = require('.')

describe('parseOldLDN()', () => {
  it('we can parse trigger comment correctly', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/large_client_application.test.md'),
      { encoding: 'utf8' },
    )

    const parsedResult = parseOldLDN(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('TVCC')
    expect(parsedResult.region).toBe('Asia excl. Japan')
    expect(parsedResult.isAddressFormatted).toBe(true)
    expect(parsedResult.datacapRequested).toBe('1PiB')
    expect(parsedResult.dataCapWeeklyAllocation).toBe('10TiB')
    expect(parsedResult.isCustomNotary).toBe(true)
    expect(parsedResult.website).toBe('www.wow.com')
    expect(parsedResult.identifier).toBe('E-fil')
  })

  it('empty issue get not validated', () => {
    const issueContentNoVals = fs.readFileSync(
      path.resolve(__dirname, '../../../samples/utils/large_client_application_no_values.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseOldLDN(issueContentNoVals)
    expect(parsedResult.correct).toBe(false)
  })
})
