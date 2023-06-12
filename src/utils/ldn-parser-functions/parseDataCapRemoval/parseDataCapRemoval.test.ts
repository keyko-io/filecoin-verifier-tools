/* eslint-disable indent */
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { parseDataCapRemoval } from '.'
const __dirname = path.resolve()

describe('parseDatacapRemoval()', () => {
    it('we can parse new template correctly', () => {
        const issueContent = readFileSync(
            resolve(__dirname, 'src/samples/utils/datacap_removal.test.md'),
            { encoding: 'utf8' },
        )

        const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')

        const parsedResult = parseDataCapRemoval(trimmed)

        expect(parsedResult.name).toBe("client test number 1")
        expect(parsedResult.url).toBe("https://www.ciao.it")
        expect(parsedResult.address).toBe("t412awjrmdk31msk098tyenssd")
        expect(parsedResult.datacapToRemove).toBe("200TiB")
    },
    )
})
