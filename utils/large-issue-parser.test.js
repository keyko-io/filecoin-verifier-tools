var fs = require('fs')
var path = require('path')
const {
  parseNotaryConfirmation,
  parseReleaseRequest,
  parseWeeklyDataCapAllocationUpdateRequest,
} = require('./large-issue-parser')

// describe('parseRemovalIssue()', () => {
//   it('we can parse an issue including the right data', () => {
//     const issueTitle = 'Large Client Request DataCap Removal: f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb'
//     const removalIssueContent = fs.readFileSync(
//       path.resolve(__dirname, '../samples/utils/large_client_datacap_removal.test.md'),
//       { encoding: 'utf8' },
//     )
//     const parsedResult = parseIssue(removalIssueContent, issueTitle)

//     expect(parsedResult.correct).toBe(true)
//     expect(parsedResult.datacapRemoval).toBe(true)
//     expect(parsedResult.address).toBe('f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb')
//     expect(parsedResult.datacapRequested).toBe('0B')
//   })
// })

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

describe('parseReleaseRequest()', () => {
  it('we can parse dataCap allocation requests', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/datacap_allocation_requested.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseReleaseRequest(commentContent)
    expect(parsedResult.multisigMessage).toBe(true)
    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.notaryAddress).toBe('f01105812')
    expect(parsedResult.clientAddress).toBe('f3vnq2cmwig3qjisnx5hobxvsd4drn4f54xfxnv4tciw6vnjdsf5xipgafreprh5riwmgtcirpcdmi3urbg36a')
    expect(parsedResult.allocationDatacap).toBe('10TiB')
    expect(parsedResult.allocationDataCapAmount[0]).toBe('10TiB')
  })
})

describe('parseWeeklyDataCapAllocationUpdateRequest()', () => {
  it('we can parse dataCap allocation updates requests', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/weekly_datacap_update_request.test.md'),
      { encoding: 'utf8' },
    )

    const parsedResult = parseWeeklyDataCapAllocationUpdateRequest(commentContent)
    expect(parsedResult.multisigMessage).toBe(true)
    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.allocationDatacap).toBe('10TiB')
  })
})


