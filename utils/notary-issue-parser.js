const {
  matchGroupLargeNotary,
  matchAll,
} = require('./common-utils')

function parseNotaryAddress(issueContent) {
  const regexObj = {
    regexAddressZero: /-?\s*On-chain\s*Address\(es\)\s*to\s*be\s*Notarized:\s*(.*)/mi,
    regexAddressOne: /-?\s*On-chain\s*Address\s*to\s*be\s*Notarized:\s*(.*)/mi,
    regexAddressTwo: /-?\s*On-chain\s*address\s*to\s*be\s*notarized\s*\(recommend using a new address\):\s*(.*)/mi,
  }

  for (const key of Object.keys(regexObj)) {
    const address = matchGroupLargeNotary(regexObj[key], issueContent)

    if (address) {
      return address
    }
  }
  return false
}

function parseIssue(issueContent, issueTitle = '') {
  const regexName = /-\s*Name:\s*(.*)/m
  const regexAffilOrg = /-\s*Affiliated\s*organization:\s*(.*)/m

  // address
  const regexAddress = /-\s*On-chain\s*Address\(es\)\s*to\s*be\s*Notarized:\s*(.*)/mi
  const regexAlternativeAddress = /-\s*On-chain\s*address\s*to\s*be\s*notarized\s*\(recommend using a new address\):\s*(.*)/mi
  const regexCountry = /-\s*Country\s*of\s*Operation:\s*(.*)/m
  const regexRegion = /-\s*Region\s*of\s*Operation:\s*(.*)/m
  const regexUseCases = /-\s*Use\s*case\(s\)\s*to\s*be\s*supported:\s*(.*)/m

  // datacap
  const regexDatacapRequested = /-\s*DataCap\s*requested\s*for\s*allocation\s*\(10TiB - 1PiB\):\s*(.*)/m
  const regexDatacapRequested2 = /-\s*DataCap\s*Requested:\s*(.*)/m
  const regexBehalf = /-\s*Are you applying on behalf of yourself or an organization\?:\s*(.*)/m

  const regextRemovalTitle = /\s*Notary\s*DataCap\s*Removal:\s*(.*)/m

  const name = matchGroupLargeNotary(regexName, issueContent)
  // const website = matchGroupLargeNotary(regexWebsite, issueContent)

  const address = matchGroupLargeNotary(regexAddress, issueContent)
  const alternativeAddress = matchGroupLargeNotary(regexAlternativeAddress, issueContent)

  const datacapRequested = matchGroupLargeNotary(regexDatacapRequested, issueContent)
  const datacapRequested2 = matchGroupLargeNotary(regexDatacapRequested2, issueContent)
  const region = matchGroupLargeNotary(regexRegion, issueContent)
  const country = matchGroupLargeNotary(regexCountry, issueContent)

  const useCases = matchGroupLargeNotary(regexUseCases, issueContent)
  const behalf = matchGroupLargeNotary(regexBehalf, issueContent)
  const organization = matchGroupLargeNotary(regexAffilOrg, issueContent)

  if (
    name != null &&
    (address || alternativeAddress) &&
    (datacapRequested || datacapRequested2) &&
    region != null &&
    useCases != null &&
    behalf != null &&
    organization != null &&
    country != null
  ) {
    return {
      correct: true,
      errorMessage: '',
      errorDetails: '',
      name,
      organization,
      address: address || (alternativeAddress),
      country,
      region,
      useCases,
      datacapRequested: datacapRequested || datacapRequested2,
      behalf,
      datacapRemoval: false,
      website: '',

    }
  }

  if (issueTitle !== '') {
    const removalAddress = matchGroupLargeNotary(regextRemovalTitle, issueTitle)
    if (removalAddress != null) {
      return {
        correct: true,
        errorMessage: '',
        errorDetails: '',
        name: '',
        address: removalAddress,
        datacapRequested: '0B',
        website: '',
        region: '',
        useCases: '',
        datacapRemoval: true,
      }
    }
  }

  let errorMessage = ''
  if (name == null) { errorMessage += 'We could not find your **Name** in the information provided\n' }
  if (!address && !alternativeAddress) { errorMessage += 'We could not find your **Filecoin address** in the information provided\n' }
  if (!datacapRequested && !datacapRequested2) { errorMessage += 'We could not find the **Datacap** requested in the information provided\n' }
  // if (website == null) { errorMessage += 'We could not find any **Web site or social media info** in the information provided\n' }
  if (region == null) { errorMessage += 'We could not find any **Region** in the information provided\n' }
  if (useCases == null) { errorMessage += 'We could not find any **Use Case** in the information provided\n' }
  if (country == null) { errorMessage += 'We could not find any **Country** in the information provided\n' }
  if (behalf == null) { errorMessage += 'We could not find any answer to: **Are you applying on behalf of yourself or an organization?** in the information provided\n' }

  return {
    correct: false,
    errorMessage,
    errorDetails: `Unable to find required attributes.
        The name= ${name},
        address= ${address},
        datacapRequested= ${datacapRequested},
        website= ${''},
        region= ${region},
        useCases= ${useCases}`,
  }
}

// function matchGroupLargeNotary(regex, content) {
//   let m
//   if ((m = regex.exec(content)) !== null) {
//     if (m.length >= 2) {
//       return m[1]
//     }
//     return m[0]
//   }
// }

function parseApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*Approved/m
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
      address,
      datacap,
    }
  }

  let errorMessage = ''
  if (address == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacap == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage,
    errorDetails: `Unable to find required attributes.
          The address= ${address},
          datacapAllocated= ${datacap}`,
  }
}

// function matchAll(regex, content) {
//   var matches = [...content.matchAll(regex)]
//   if (matches !== null) {
//     // each entry in the array has this form: Array ["#### Address > f1111222333", "", "f1111222333"]
//     return matches.map(elem => elem[2])
//   }
// }

function parseMultipleApproveComment(commentContent) {
  const regexApproved = /##\s*Request\s*Approved/m
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
      addresses,
      datacaps,
    }
  }

  let errorMessage = ''
  if (addresses == null) { errorMessage += 'We could not find the **Filecoin address** in the information provided in the comment\n' }
  if (datacaps == null) { errorMessage += 'We could not find the **Datacap** allocated in the information provided in the comment\n' }
  return {
    approvedMessage: true,
    correct: false,
    errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

function parseNotaryLedgerVerifiedComment(commentContent) {
  const regexVerified = /##\s*Notary\s*Ledger\s*Verified/m
  // const regexMessageCid = />\s*Message\s*CID:\s*(.*)/m

  const verified = matchGroupLargeNotary(regexVerified, commentContent)

  // const messageCid = matchGroupLargeNotary(regexMessageCid, commentContent)

  if (verified) {
    return {
      correct: true,
      // messageCid: messageCid,
    }
  }

  let errorMessage = ''
  if (!verified) { errorMessage += 'The issue is not verified\n' }
  // if (!messageCid) { errorMessage += 'Message CID not found in the comment\n' }
  return {
    correct: false,
    errorMessage,
    errorDetails: 'Unable to find required attributes.',
  }
}

exports.parseIssue = parseIssue
exports.parseApproveComment = parseApproveComment
exports.parseMultipleApproveComment = parseMultipleApproveComment
exports.parseNotaryLedgerVerifiedComment = parseNotaryLedgerVerifiedComment
exports.parseNotaryAddress = parseNotaryAddress
