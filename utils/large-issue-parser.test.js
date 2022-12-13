var fs = require('fs')
var path = require('path')
const {
  parseIssue,
  parseNotaryConfirmation,
  parseMultisigNotaryRequest,
  parseReleaseRequest,
  parseWeeklyDataCapAllocationUpdateRequest,
  parseApprovedRequestWithSignerAddress,
  parseMultisigReconnectComment,
} = require('./large-issue-parser')

describe('parseIssue()', () => {
  it.only('we can parse an issue including the right data', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/large_client_application.test.md'),
      { encoding: 'utf8' },
    )

    const parsedResult = parseIssue(issueContent)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.name).toBe('TVCC')
    expect(parsedResult.region).toBe('Asia excl. Japan')
    expect(parsedResult.isAddressFormatted).toBe(true)
    expect(parsedResult.datacapRequested).toBe('1PiB')
    expect(parsedResult.dataCapWeeklyAllocation).toBe('10TiB')
    expect(parsedResult.isCustomNotary).toBe(true)
    expect(parsedResult.website).toBe('www.wow.com')
  })

  it('we can parse new template correctly', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/new_ldn_template_yaml.md'),
      { encoding: 'utf8' },
    )

    const parsedResult = parseIssue(issueContent)

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

  it('we can not parse an invalid issue', () => {
    const parsedResult = parseIssue('random string')
    expect(parsedResult.correct).toBe(false)
    expect(parsedResult.errorMessage).not.toBe('')
  })

  it('empty issue get not validated', () => {
    const issueContentNoVals = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/large_client_application_no_values.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContentNoVals)
    expect(parsedResult.correct).toBe(false)
  })
})

describe('parseIssue with custom notary()', () => {
  it('wpare issue with type: custom notary', () => {
    const issueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/large_client_application_custom_notary.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContent)
    expect(parsedResult.isCustomNotary).toBe(true)
  })

  it('we can not parse an invalid issue', () => {
    const parsedResult = parseIssue('random string')
    expect(parsedResult.correct).toBe(false)
    expect(parsedResult.errorMessage).not.toBe('')
  })

  it('empty issue get not validated', () => {
    const issueContentNoVals = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/large_client_application_no_values.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(issueContentNoVals)
    expect(parsedResult.correct).toBe(false)
  })
})

describe('parseRemovalIssue()', () => {
  it('we can parse an issue including the right data', () => {
    const issueTitle = 'Large Client Request DataCap Removal: f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb'
    const removalIssueContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/large_client_datacap_removal.test.md'),
      { encoding: 'utf8' },
    )
    const parsedResult = parseIssue(removalIssueContent, issueTitle)

    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.datacapRemoval).toBe(true)
    expect(parsedResult.address).toBe('f1sdzgaqmitbvgktkklpuaxohg6nuhce5eyvwxhbb')
    expect(parsedResult.datacapRequested).toBe('0B')
  })
})

describe('parseApprovedRequestWithSignerAddress()', () => {
  it.only('we can parse an approve comment including the right data', () => {
    const proposeComment = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/ldn_propose_dc_request_comment.test.md'),
      { encoding: 'utf8' },
    )

    const parsedResultProposed = parseApprovedRequestWithSignerAddress(proposeComment)

    console.log(parsedResultProposed, 'XX')

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
      path.resolve(__dirname, '../samples/utils/ldn_approve_dc_request_comment.test.md'),
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
  // expect(parsedResult.addresses.length).toBe(7)
  // expect(parsedResult.addresses[0]).toBe('f1qoxqy3npwcvoqy7gpstm65lejcy7pkd3hqqekna')
  expect(parsedResult.multisigMessage).toBe(true)
  expect(parsedResult.correct).toBe(true)
  expect(parsedResult.totalDatacaps[0]).toBe('5PiB')
  expect(parsedResult.weeklyDatacap[0]).toBe('500TiB')
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

describe('parseMultisigReconnectComment()', () => {
  it('we can parse reconnection request', () => {
    const commentContent = fs.readFileSync(
      path.resolve(__dirname, '../samples/utils/issue_reconnection_requested.test.md'),
      { encoding: 'utf8' },
    )

    const parsedResult = parseMultisigReconnectComment(commentContent)
    expect(parsedResult.correct).toBe(true)
    expect(parsedResult.msigAddress).toBe('f01105812')
    expect(parsedResult.issueURI).toBe('https://github.com/keyko-io/filecoin-notaries-onboarding/issues/370')
  })
})
