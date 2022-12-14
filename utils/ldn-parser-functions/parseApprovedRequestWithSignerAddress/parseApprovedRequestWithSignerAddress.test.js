/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const { parseApprovedRequestWithSignerAddress } = require('.')

describe('parseApprovedRequestWithSignerAddress()', () => {
    it('we can parse an approve comment including the right data', () => {
        const proposeComment = fs.readFileSync(
            path.resolve(__dirname, '../../../samples/utils/ldn_propose_dc_request_comment.test.md'),
            { encoding: 'utf8' },
        )

        const parsedResultProposed = parseApprovedRequestWithSignerAddress(proposeComment)

        expect(parsedResultProposed.method).toBe('Proposed')
        expect(parsedResultProposed.correct).toBe(true)
        expect(parsedResultProposed.approvedMessage).toBe(true)
        expect(parsedResultProposed.address).toBe('t1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq')
        expect(parsedResultProposed.datacap).toBe('50TiB')
        expect(parsedResultProposed.signerAddress).toBe('t1gechnbsldgbqan4q2dwjsicbh25n5xvvdzhqd3y')
        expect(parsedResultProposed.message).toBe('bafy2bzacec7gf6xycdqw3fzgs76ppn3mgtojntd5tvqrrmedvcqciw5tghjps')
    })
    it('we can parse an approve comment including the right data', () => {
        const approveComment = fs.readFileSync(
            path.resolve(__dirname, '../../../samples/utils/ldn_approve_dc_request_comment.test.md'),
            { encoding: 'utf8' },
        )
        const parsedResultApprove = parseApprovedRequestWithSignerAddress(approveComment)

        expect(parsedResultApprove.method).toBe('Approved')
        expect(parsedResultApprove.correct).toBe(true)
        expect(parsedResultApprove.approvedMessage).toBe(true)
        expect(parsedResultApprove.address).toBe('t1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq')
        expect(parsedResultApprove.datacap).toBe('50TiB')
        expect(parsedResultApprove.signerAddress).toBe('t1gechnbsldgbqan4q2dwjsicbh25n5xvvdzhqd3y')
        expect(parsedResultApprove.message).toBe('bafy2bzacec7gf6xycdqw3fzgs76ppn3mgtojntd5tvqrrmedvcqciw5tghjps')
    })
})
