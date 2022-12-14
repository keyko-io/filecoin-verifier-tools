/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseNewLdn } = require('./parseNewLdn')

describe('parseOldLDN()', () => {
    it('we can parse new template correctly', () => {
        const issueContent = fs.readFileSync(
            path.resolve(__dirname, '../.././samples/utils/new_ldn_template_yaml.md'),
            { encoding: 'utf8' },
        )

        const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

        const parsedResult = parseNewLdn(trimmed)

        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.name).toBe('alberto')
        expect(parsedResult.region).toBe('Åland Islands')
        expect(parsedResult.isAddressFormatted).toBe(true)
        expect(parsedResult.datacapRequested).toBe('4PiB')
        expect(parsedResult.dataCapWeeklyAllocation).toBe('200TiB')
        expect(parsedResult.website).toBe('rob.co')
        expect(parsedResult.address).toBe('f1212121212121')
        expect(parsedResult.identifier).toBe('E-fil')
    },
    )
})
