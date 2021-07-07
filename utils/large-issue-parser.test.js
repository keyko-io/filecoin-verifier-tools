var fs = require('fs')
var path = require('path')
const {
  parseIssue,
  parseApproveComment,
  parseMultipleApproveComment,
  parseNotaryConfirmation,
  parseMultisigNotaryRequest,
} = require('./large-issue-parser')

describe('parseIssue()', () => {
  it('we can parse an issue including the right data', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/large_client_application.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('Client A')
    expect(parsedResult.address).toBe('f1111222333')
    expect(parsedResult.datacapRequested).toBe('10TB')
    expect(parsedResult.website).toBe('info.org')
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
    const issueTitle = 'Large Client Request DataCap Removal: f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb'

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
      path.resolve(__dirname, '../samples/utils/large_request_approved_comment.test.md'),
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
      path.resolve(__dirname, '../samples/utils/large_request_approved_comment.test.md'),
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

describe('parseNotaryConfirmation()', () => {
  const commentContent = fs.readFileSync(
    path.resolve(__dirname, '../samples/utils/notary_confirmation.test.md'),
    { encoding: 'utf8' },

  )
  const title = 'Large dataset multisig request #12345'

  it('we can parse notary confirmation message and number of title', () => {
    const parsedResult = parseNotaryConfirmation(commentContent, title)
    expect(parsedResult.confirmationMessage).toBe(true)
    expect(parsedResult.number).toBe(12345)
  })
  it('we cannnot parse a null confirmation', () => {
    const parsedResult = parseNotaryConfirmation(null, title)
    expect(parsedResult.confirmationMessage).toBe(false)
  })
})

describe('parseMultisigNotaryRequest()', () => {
  const commentContent = fs.readFileSync(
    path.resolve(__dirname, '../samples/utils/multising_notary_requested.test.md'),
    { encoding: 'utf8' },
  )
  const parsedResult = parseMultisigNotaryRequest(commentContent)
  expect(parsedResult.addresses.length).toBe(7)
  expect(parsedResult.addresses[0]).toBe('f1qoxqy3npwcvoqy7gpstm65lejcy7pkd3hqqekna')
  expect(parsedResult.multisigMessage).toBe(true)
  expect(parsedResult.correct).toBe(true)
  expect(parsedResult.totalDatacaps[0]).toBe('5PiB')
  expect(parsedResult.weeklyDatacap[0]).toBe('500TiB')
})
