/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseOldLDN } from '.'
const __dirname = path.resolve();

describe('parseOldLDN()', () => {
  it('we can parse trigger comment correctly', () => {
    const issueContent = readFileSync(
      resolve(__dirname, 'samples/utils/large_client_application.test.md'),
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
})
