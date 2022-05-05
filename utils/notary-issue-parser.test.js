var fs = require('fs')
var path = require('path')
const {
  parseIssue,
  parseApproveComment,
  parseMultipleApproveComment,
  parseNotaryLedgerVerifiedComment,
  parseNotaryAddress
} = require('./notary-issue-parser')

describe('parseIssue()', () => {
  it('we can parse an issue including the right data', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/notary_application.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContent)

    // expect(parsedResult.correct).toBe(true)
    // expect(parsedResult.name).toBe('Notary A')
    // expect(parsedResult.address).toBe('f1111222333')
    // expect(parsedResult.alternativeAddress).toBe('f1111222333')
    // expect(parsedResult.datacapRequested).toBe('10TiB')
    // expect(parsedResult.website).toBe('info.org')
    // expect(parsedResult.region).toBe('[North America]')
    // expect(parsedResult.useCases).toBe('[Developer Tools, Web 3.0]')
  })

  it('we can not parse an invalid issue', () => {
    const parsedResult = parseIssue('random string')
    expect(parsedResult.correct).toBe(false)
    expect(parsedResult.errorMessage).not.toBe('')
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

describe('parseApproved()', () => {
  it('we can parse an approve comment including the right data', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/notary_approved_comment.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseApproveComment(commentContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.approvedMessage).toBe(true)
    expect(parsedResult.address).toBe('f1111222333')
    expect(parsedResult.datacap).toBe('5TiB')
  })
})

describe('parseApprovedMultiple()', () => {
  it('we can parse an approve comment including the right data', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/notary_approved_comment.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseMultipleApproveComment(commentContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.approvedMessage).toBe(true)
    expect(parsedResult.addresses[0]).toBe('f1111222333')
    expect(parsedResult.datacaps[0]).toBe('5TiB')
    expect(parsedResult.addresses[1]).toBe('f33332222111')
    expect(parsedResult.datacaps[1]).toBe('1TiB')
    expect(parsedResult.addresses[2]).toBe('f222233334444')
    expect(parsedResult.datacaps[2]).toBe('10TiB')
  })
})

describe('parseNotaryLedgerVerifiedComment()', () => {
  it('we can parse the Notary Ledger Verified comment', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/notary_ledger_verified_comment.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseNotaryLedgerVerifiedComment(commentContent)

    expect(parsedResult.correct).toBe(true)
    // expect(parsedResult.messageCid).toBe('bafy2bzacedeu7ymgdg3gwy522gtoy4a6j6v433cur4wjlv2xjeqtvm4bkymoi')
  })
})

describe('parseNotaryAddress()', () => {
  it('we can parse the Notary address', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/notary_application.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseNotaryAddress(commentContent)

    console.log(parsedResult)
    expect(parsedResult).toBe('f1fkxkfxgopjf3ufnfg5i3m6qlwf73kp4w5zz7nnq')
    // expect(parsedResult.messageCid).toBe('bafy2bzacedeu7ymgdg3gwy522gtoy4a6j6v433cur4wjlv2xjeqtvm4bkymoi')
  })
})
