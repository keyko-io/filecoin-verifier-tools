/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseOldLDN } from '.'
const __dirname = path.resolve()

describe('parseOldLDN()', () => {
  it('we can parse trigger comment correctly', () => {
    const issueContent = readFileSync(
      resolve(__dirname, 'src/samples/utils/large_client_application.test.md'),
      { encoding: 'utf8' },
    )

    const parsedResult = parseOldLDN(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('TVCC')
    expect(parsedResult.address).toBe("f3tbfu6dptaui5uwdt7tlhzmovocz47z2fv34dewwhvkf6heel63zqv6ro7we5fvfzndmofel64dggk5vdr5rq")
    expect(parsedResult.region).toBe('Asia excl. Japan')
    expect(parsedResult.isAddressFormatted).toBe(true)
    expect(parsedResult.datacapRequested).toBe('1PiB')
    expect(parsedResult.dataCapWeeklyAllocation).toBe('10TiB')
    expect(parsedResult.isCustomNotary).toBe(true)
    expect(parsedResult.website).toBe('www.wow.com')
    expect(parsedResult.identifier).toBe('E-fil')
  })
})

// https://github.com/filecoin-project/filecoin-plus-large-datasets/issues/391
describe('parseOldLDN()', () => {
  it('391_type', () => {
    const issueContent = readFileSync(
      resolve(__dirname, 'src/samples/utils/391_type_req.test.md'),
      { encoding: 'utf8' },
    )

    const parsedResult = parseOldLDN(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('BigData Exchange')
    expect(parsedResult.website).toBe('www.bigd.exchange / https://twitter.com/BigD_Exchange')
    expect(parsedResult.datacapRequested).toBe('3.24PiB')
    expect(parsedResult.dataCapWeeklyAllocation).toBe('300TiB')
    expect(parsedResult.address).toBe('f1fkh47gdwclmovclfz2kvorhhdofvgr5y7fjvkmi')
    expect(parsedResult.isAddressFormatted).toBe(true)
  })
})