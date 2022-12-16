/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { ldnv3TriggerCommentParser } = require('.')

// describe('v3 Datacap Request Trigger', () => {
//     it('we can parse trigger comment correctly', () => {
//         const commentContent = fs.readFileSync(
//             path.resolve(__dirname, '../../../samples/utils/v3_trigger.test.md'),
//             { encoding: 'utf8' },
//         )

//         const parsedResult = ldnv3TriggerCommentParser(commentContent)

//         expect(parsedResult.correct).toBe(true)
//         expect(parsedResult.totalDatacap).toBe('5PiB')
//         expect(parsedResult.weeklyDatacap).toBe('100TiB')
//     })

//     it('if the fields are empty , it should give us error and error message', () => {
//         const commentContent = fs.readFileSync(
//             path.resolve(__dirname, '../../../samples/utils/v3_trigger_wrong.test.md'),
//             { encoding: 'utf8' },
//         )

//         const parsedResult = ldnv3TriggerCommentParser(commentContent)

//         expect(parsedResult.correct).toBe(false)
//         expect(parsedResult.errorMessage).not.toBe('')
//     })
// })
describe('v3 Datacap Request Trigger', () => {
    it('we can parse trigger comment correctly', () => {
        const commentContent = fs.readFileSync(
            path.resolve(__dirname, '../../../samples/utils/v3_trigger.test.md'),
            { encoding: 'utf8' },
        )

        ldnv3TriggerCommentParser(commentContent)

         const parsedResult = ldnv3TriggerCommentParser(commentContent)

        expect(parsedResult.correct).toBe(true)
        expect(parsedResult.totalDatacap).toBe('5PiB')
        expect(parsedResult.weeklyDatacap).toBe('100TiB')
        expect(parsedResult.clientAddress).toBe('f1o7z3hrmxthl2yohnoabk2bmmveg6aoomatv52hq')
    })

    // it('if the fields are empty , it should give us error and error message', () => {
    //     const commentContent = fs.readFileSync(
    //         path.resolve(__dirname, '../../../samples/utils/v3_trigger_wrong.test.md'),
    //         { encoding: 'utf8' },
    //     )

    //     const parsedResult = ldnv3TriggerCommentParser(commentContent)

    //     expect(parsedResult.correct).toBe(false)
    //     expect(parsedResult.errorMessage).not.toBe('')
    // })
})
