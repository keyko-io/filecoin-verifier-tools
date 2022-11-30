const ownerName = /[\n\r]*###\s*Data\s*Owner\s*Name[\n\t]*([^\n\r]*)/
const web = /[\n\r]*###\s*Website[\n\t]*([^\n\r]*)/
const ownerCountry =
  /[\n\r]*###\s*Data\s*Owner\s*Country[\n\t]*([^\n\r]*)/
const totalData =
  /[\n\r]*###\s*Total\s*amount\s*of\s*DataCap\s*being\s*requested[\n\t]*([^\n\r]*)/
const weeklyData =
  /[\n\r]*###\s*Weekly\s*allocation\s*of\s*DataCap\s*requested[\n\t]*([^\n\r]*)/
const onchain =
  /[\n\r]*###\s*On-chain\s*address\s*for\s*first\s*allocation[\n\t]*([^\n\r]*)/

function matchGroupLargeNotary(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 2) {
      return m[1].trim()
    }
    return m[0].trim()
  }
}

function test_new_template(issueContent) {
  const name = matchGroupLargeNotary(ownerName, issueContent)
  const website = matchGroupLargeNotary(web, issueContent)
  const country = matchGroupLargeNotary(ownerCountry, issueContent)
  const total = matchGroupLargeNotary(totalData, issueContent)
  const weekly = matchGroupLargeNotary(weeklyData, issueContent)
  const address = matchGroupLargeNotary(onchain, issueContent)

  return {
    name,
    website,
    country,
    total,
    weekly,
    address,
  }
}

exports.test_new_template = test_new_template
