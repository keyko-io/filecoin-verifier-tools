import { matchGroupLargeNotary } from '../../common-utils'

export function parseNotaryAddress(issueContent) {
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
