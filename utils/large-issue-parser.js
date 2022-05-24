const {
  matchGroupLargeNotary,
  matchAll,
} = require('./common-utils')

function parseOtherInfoIssue(issueContent) {
  const rgxObj = {

    // PRJ DETAILS
    detailsHistory: /Share a brief history of your project and organization.\s*[\n]```\n\s*(.*)/,
    detailsSrcFunding: /What is the primary source of funding for this project\?\s*[\n]```\n\s*(.*)/,
    detailsSrcOtherProjects: /What other projects\/ecosystem stakeholders is this project associated with\?\s*[\n]```\n\s*(.*)/,

    // Use-case details
    useCaseDescribeData: /Describe the data being stored onto Filecoin\s*[\n]```\n\s*(.*)/,
    useCaseWhereDataIsStored: /Where was the data in this dataset sourced from\?\s*[\n]```\n\s*(.*)/,
    useCaseDataSample: /Can you share a sample of the data\? A link to a file, an image, a table, etc., are good ways to do this.\s*[\n]```\n\s*(.*)/,
    useCaseIsPublicDataSet: /Confirm that this is a public dataset that can be retrieved by anyone on the Network \(i.e., no specific permissions or access rights are required to view the data\).\s*[\n]```\n\s*(.*)/,
    useCaseExpectedRetrievalFrequency: /What is the expected retrieval frequency for this data\?\s*[\n]```\n\s*(.*)/,
    useCaseHowLongStoredInFilecoin: /For how long do you plan to keep this dataset stored on Filecoin\?\s*[\n]```\n\s*(.*)/,

    // DataCap allocation plan
    dataCapAllocationPlanRegion: /In which geographies \(countries, regions\) do you plan on making storage deals\?\s*[\n]```\n\s*(.*)/,
    dataCapAllocationPlanDistribute: /How will you be distributing your data to storage providers\? Is there an offline data transfer process\?\s*[\n]```\n\s*(.*)/,
    dataCapAllocationPlanChooseSp: /How do you plan on choosing the storage providers with whom you will be making deals\? This should include a plan to ensure the data is retrievable in the future both by you and others.\s*[\n]```\n\s*(.*)/,
    dataCapAllocationPlanDeals: /How will you be distributing deals across storage providers\?\s*[\n]```\n\s*(.*)/,
    dataCapAllocationPlanHasResources: /Do you have the resources\/funding to start making deals as soon as you receive DataCap\? What support from the community would help you onboard onto Filecoin\?\s*[\n]```\n\s*(.*)/,
  }

  const retObj = {}
  for (const key of Object.keys(rgxObj)) {
    retObj[key] = rgxObj[key].exec(issueContent)[1]
  }
  return retObj
}

function parseIssue(issueContent, issueTitle = '') {
  const regexName = /[\n\r][ \t]*-\s*Organization\s*Name:[ \t]*([^\n\r]*)/
  const regexRegion = /[\n\r][ \t]*-\s*Region:[ \t]*([^\n\r]*)/
  const regexWebsite = /[\n\r][ \t]*-\s*Website\s*\/\s*Social\s*Media:[ \t]*([^\n\r]*)/m
  const regexAddress = /[\n\r][ \t]*-\s*On-chain\s*address\s*for\s*first\s*allocation:[ \t]*([^\n\r]*)/m
  const regexDatacapRequested = /[\n\r][ \t]*-\s*Total\s*amount\s*of\s*DataCap\s*being\s*requested\s*\(between 500 TiB and 5 PiB\)\s*:[ \t]*([^\n\r]*)/m
  const regextRemovalTitle = /#\s*Large\s*Client\s*Request\s*DataCap\s*Removal:[ \t]*([^\n\r]*)/m
  const regexWeeklyDataCapAllocation = /[\n\r][ \t]*-\s*Weekly\s*allocation\s*of\s*DataCap\s*requested\s*\(usually between 1-100TiB\)\s*:[ \t]*([^\n\r]*)/m

  const name = matchGroupLargeNotary(regexName, issueContent)
  const region = matchGroupLargeNotary(regexRegion, issueContent)
  const website = matchGroupLargeNotary(regexWebsite, issueContent)
  const address = matchGroupLargeNotary(regexAddress, issueContent)
  const datacapRequested = matchGroupLargeNotary(regexDatacapRequested, issueContent)
  const dataCapWeeklyAllocation = matchGroupLargeNotary(regexWeeklyDataCapAllocation, issueContent)

  const regexForAdress = /^(f1|f3)/
  const isAddressFormatted = regexForAdress.test(address)

  if (name && address && datacapRequested && website && dataCapWeeklyAllocation) {
    return {
      correct: true,
      errorMessage: '',
      errorDetails: '',
      name: name,
      address: address,
      datacapRequested: datacapRequested,
      dataCapWeeklyAllocation: dataCapWeeklyAllocation,
      website: website,
      datacapRemoval: false,
      region: region,
      isAddressFormatted,
    }
  }

  if (issueTitle !== '') {
    const removalAddress = matchGroupLargeNotary(regextRemovalTitle, issueContent)
    if (removalAddress) {
      return {
        correct: true,
        errorMessage: '',
        errorDetails: '',
        name: '',
        address: removalAddress,
        datacapRequested: '0B',
        dataCapWeeklyAllocation: '0B',
        website: '',
        datacapRemoval: true,
        region: '',
      }
    }
  }

  let errorMessage = ''
  if (!name) { errorMessage += 'We could not find your **Name** in the information provided\n' }
  if (!address) { errorMessage += 'We could not find your **Filecoin address** in the information provided\n' }
  if (!datacapRequested) { errorMessage += 'We could not find the **Datacap** requested in the information provided\n' }
  if (!website) { errorMessage += 'We could not find any **Web site or social media info** in the information provided\n' }
  if (!dataCapWeeklyAllocation) { errorMessage += 'We could not find any **Expected weekly DataCap usage rate** in the information provided\n' }
  if (!region) { errorMessage += 'We could not find any **Region** in the information provided\n' }

  return {
    correct: false,
    errorMessage: errorMessage,
    errorDetails: `Unable to find required attributes.
        The name= ${name},
        address= ${address},
        datacapRequested= ${datacapRequested},
        website= ${website}`,
  }
}

function parseApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*((Approved)|(Proposed))/m
  const regexAddress = /####\s*Address\W*^>\s*(.*)/m
  const regexDatacap = /####\s*Datacap\s*Allocated\W*^>\s*(.*)/m

  const approved = matchGroupLargeNotary(regexApproved, commentContent)

  if (approved == null) {
    return {
      approvedMessage: false,
    }
  }

  const address = matchGroupLargeNotary(regexAddress, commentContent)
  const datacap = matchGroupLargeNotary(regexDatacap, commentContent)

  if (address != null && datacap != null) {
    return {
      approvedMessage: true,
      correct: true,
      address: address,
      datacap: datacap,
    }
  }

  let errorMessage = ''
  if (address == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacap == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: `Unable to find required attributes.
          The address= ${address},
          datacapAllocated= ${datacap}`,
  }
}

function parseMultipleApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*((Approved)|(Proposed))/m
  const regexAddress = /####\s*Address\s*(.*)\n>\s*(.*)/g
  const regexDatacap = /####\s*Datacap\s*Allocated\s*(.*)\n>\s*(.*)/g

  const approved = matchGroupLargeNotary(regexApproved, commentContent)

  if (approved == null) {
    return {
      approvedMessage: false,
    }
  }

  const datacaps = matchAll(regexDatacap, commentContent)
  const addresses = matchAll(regexAddress, commentContent)

  if (addresses != null && datacaps != null) {
    return {
      approvedMessage: true,
      correct: true,
      addresses: addresses,
      datacaps: datacaps,
    }
  }

  let errorMessage = ''
  if (addresses == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacaps == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseApprovedRequestWithSignerAddress(commentContent) {
  const regexApproved = /##\s*Request\s*((Approved)|(Proposed))/m
  const regexAddress = /####\s*Address\W*^>\s*(.*)/m
  const regexDatacap = /####\s*Datacap\s*Allocated\W*^>\s*(.*)/m
  const regexSignerAddress = /####\s*Signer\s*Address\s*\n>\s*(.*)/g
  const regexMessage = /####\s*Message\s*sent\s*to\s*Filecoin\s*Network\s*\n>\s*(.*)/g

  const approved = matchGroupLargeNotary(regexApproved, commentContent)

  if (approved == null) {
    return {
      approvedMessage: false,
    }
  }

  const datacap = matchGroupLargeNotary(regexDatacap, commentContent)
  const address = matchGroupLargeNotary(regexAddress, commentContent)
  const signerAddress = matchGroupLargeNotary(regexSignerAddress, commentContent)
  const message = matchGroupLargeNotary(regexMessage, commentContent)

  if (address != null && datacap != null && signerAddress != null && message != null) {
    return {
      approvedMessage: true,
      correct: true,
      address: address,
      datacap: datacap,
      signerAddress: signerAddress,
      message: message,
    }
  }

  let errorMessage = ''
  if (address == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacap == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  if (signerAddress == null) { errorMessage += 'We could not find the **signerAddress** in the information provided in the comment\n' }
  if (message == null) { errorMessage += 'We could not find the **message** in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function ldnv3TriggerCommentParser(commentBody) {
  const regexTrigger = /##\s*datacap\s*request\s*trigger/mi
  return regexTrigger.test(commentBody)
}

function parseMultisigNotaryRequest(commentContent) {
  const regexMultisig = /##\s*Multisig\s*Notary\s*requested/m
  const regexTotalDatacap = /####\s*Total\s*DataCap\s*requested\s*(.*)\n>\s*(.*)/g
  const regexWeeklyDatacap = /####\s*Expected\s*weekly\s*DataCap\s*usage\s*rate\s*(.*)\n>\s*(.*)/g

  const multisig = matchGroupLargeNotary(regexMultisig, commentContent)

  if (multisig == null) {
    return {
      multisigMessage: false,
    }
  }

  const totalDatacaps = matchAll(regexTotalDatacap, commentContent)
  const weeklyDatacap = matchAll(regexWeeklyDatacap, commentContent)

  if (totalDatacaps != null && weeklyDatacap) {
    return {
      multisigMessage: true,
      correct: true,
      totalDatacaps: totalDatacaps,
      weeklyDatacap: weeklyDatacap,
    }
  }

  let errorMessage = ''
  // if (addresses == null || addresses.length === 0) { errorMessage += 'We could not find the **Filecoin addresses** in the information provided in the comment\n' }
  if (totalDatacaps == null) { errorMessage += 'We could not find the **Total Datacap** allocated in the information provided in the comment\n' }
  if (weeklyDatacap == null) { errorMessage += 'We could not find the **Weekly Datacap** allocated in the information provided in the comment\n' }
  return {
    multisigMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseMultisigReconnectComment(commentContent) {
  const regexRequest = /##\s*Multisig\s*Notary\s*Reconnection\s*Request/m
  const regexMsigAddress = /####\s*Multisig\s*Notary\s*Address\s*(.*)\n>\s*(.*)/g
  const regexClientAddress = /####\s*Client\s*Address\s*(.*)\n>\s*(.*)/g
  const regexIssue = /####\s*Notary\s*Governance\s*Issue\s*(.*)\n>\s*(.*)/g

  const requestType = matchGroupLargeNotary(regexRequest, commentContent)
  const msigAddress = matchAll(regexMsigAddress, commentContent)[0]
  const clientAddress = matchAll(regexClientAddress, commentContent)[0]
  const issueURI = matchAll(regexIssue, commentContent)[0]

  if (requestType && msigAddress && issueURI) {
    return {
      correct: true,
      msigAddress,
      clientAddress,
      issueURI,
    }
  }

  let errorMessage = ''
  if (msigAddress == null) { errorMessage += 'We could not find the **Multisig Notary Address** allocated in the information provided in the comment\n' }
  if (clientAddress == null) { errorMessage += 'We could not find the **Client Address** allocated in the information provided in the comment\n' }
  if (issueURI == null) { errorMessage += 'We could not find the **Notary Governance Issue** allocated in the information provided in the comment\n' }
  return {
    multisigMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseNotaryConfirmation(commentContent, title) {
  const regexConfirmation = /##\s*The\s*request\s*has\s*been\s*signed\s*by\s*a\s*new\s*Root\s*Key\s*Holder/m
  const regexTitleNumber = /Large\sdataset\smultisig\srequest\s#\s*([0-9]*)/m

  const confirmation = matchGroupLargeNotary(regexConfirmation, commentContent)
  const number = Number([...title.match(regexTitleNumber)][1])

  if (confirmation == null) {
    return {
      confirmationMessage: false,
    }
  } else {
    return {
      confirmationMessage: true,
      number: number,
    }
  }
}

function parseReleaseRequest(commentContent) {
  const regexMultisig = /##\s*DataCap\s*Allocation\s*requested/m
  const regexNotaryAddress = /####\s*Multisig\s*Notary\s*address\s*>\s*(.*)/g
  const regexClientAddress = /####\s*Client\s*address\s*>\s*(.*)/g
  const regexAllocationDatacap = /####\s*DataCap\s*allocation\s*requested\s*\n>\s*(.*)/g

  const multisig = matchGroupLargeNotary(regexMultisig, commentContent)

  if (multisig == null) {
    return {
      multisigMessage: false,
    }
  }

  const notaryAddress = matchGroupLargeNotary(regexNotaryAddress, commentContent)
  const clientAddress = matchGroupLargeNotary(regexClientAddress, commentContent)
  const allocationDatacap = matchGroupLargeNotary(regexAllocationDatacap, commentContent)

  if (notaryAddress != null && clientAddress != null && allocationDatacap != null) {
    return {
      multisigMessage: true,
      correct: true,
      notaryAddress: notaryAddress,
      clientAddress: clientAddress,
      allocationDatacap: allocationDatacap,
      allocationDataCapAmount: [allocationDatacap],
    }
  }

  let errorMessage = ''
  if (notaryAddress == null) { errorMessage += 'We could not find the **Filecoin notary address** in the information provided in the comment\n' }
  if (clientAddress == null) { errorMessage += 'We could not find the **Client address** in the information provided in the comment\n' }
  if (allocationDatacap == null) { errorMessage += 'We could not find the **Alocation datacap** in the information provided in the comment\n' }
  return {
    multisigMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseWeeklyDataCapAllocationUpdateRequest(commentContent) {
  const regexRequest = /##\s*Weekly\s*DataCap\s*Allocation\s*Update\s*requested/m
  const regexDataCap = /####\s*Update\s*to\s*expected\s*weekly\s*DataCap\s*usage\s*rate\s*>\s*(.*)/g

  const request = matchGroupLargeNotary(regexRequest, commentContent)
  if (request == null) {
    return {
      multisigMessage: false,
    }
  }

  const allocationDatacap = matchGroupLargeNotary(regexDataCap, commentContent)
  if (allocationDatacap != null) {
    return {
      multisigMessage: true,
      correct: true,
      allocationDatacap: allocationDatacap,
    }
  }

  let errorMessage = ''
  if (allocationDatacap == null) { errorMessage += 'We could not find the **Alocation datacap** in the information provided in the comment\n' }
  return {
    multisigMessage: true,
    correct: false,
    errorMessage: errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

exports.parseIssue = parseIssue
exports.parseApproveComment = parseApproveComment
exports.parseMultipleApproveComment = parseMultipleApproveComment
exports.parseMultisigNotaryRequest = parseMultisigNotaryRequest
exports.parseNotaryConfirmation = parseNotaryConfirmation
exports.parseReleaseRequest = parseReleaseRequest
exports.parseWeeklyDataCapAllocationUpdateRequest = parseWeeklyDataCapAllocationUpdateRequest
exports.parseApprovedRequestWithSignerAddress = parseApprovedRequestWithSignerAddress
exports.parseMultisigReconnectComment = parseMultisigReconnectComment
exports.parseOtherInfoIssue = parseOtherInfoIssue
exports.ldnv3TriggerCommentParser = ldnv3TriggerCommentParser
