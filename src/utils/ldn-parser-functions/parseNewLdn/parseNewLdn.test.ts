/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseNewLdn } from '.'
const __dirname = path.resolve()

describe('parseOldLDN()', () => {
    it('we can parse new template correctly', () => {
        const issueContent = readFileSync(
            resolve(__dirname, 'src/samples/utils/new_ldn_template_yaml.md'),
            { encoding: 'utf8' },
        )

        const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

        const parsedResult = parseNewLdn(trimmed)

        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.name).toBe('test')
        expect(parsedResult.region).toBe('Åland Islands')
        expect(parsedResult.isAddressFormatted).toBe(true)
        expect(parsedResult.datacapRequested).toBe('More Than 15PiB')
        expect(parsedResult.dataCapWeeklyAllocation).toBe('200TiB')
        expect(parsedResult.website).toBe('rob.co')
        expect(parsedResult.address).toBe('f1212121212121')
        expect(parsedResult.identifier).toBe('E-fil')
    },
    )
})
