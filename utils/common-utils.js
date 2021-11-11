
function validateIssueDataCap(datacap, weeklyDatacap) {
  const validateDatacapRegex = /[0-9]{1,3}[PiBT]{3,4}/g
  const resultCorrectDc = datacap ? datacap.match(validateDatacapRegex) : null
  const resultCorrectWeeklyDc = weeklyDatacap ? weeklyDatacap.match(validateDatacapRegex) : null

  return {
    resultCorrectDc,
    resultCorrectWeeklyDc,
  }
}
// used in large-issue-parser and notary-issue-parser
function matchGroupLargeNotary(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 2) {
      return m[1].trim()
    }
    return m[0].trim()
  }
}
// used is issue-parser.js
function matchGroup(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 1) { return m[1].trim() }
  }
}

function matchAll(regex, content) {
  var matches = [...content.matchAll(regex)]
  if (matches !== null) {
    // each entry in the array has this form: Array ["#### Address > f1111222333", "", "f1111222333"]
    return matches.map(elem => elem[2])
  }
}

exports.matchGroupLargeNotary = matchGroupLargeNotary
exports.matchGroup = matchGroup
exports.matchAll = matchAll
exports.validateIssueDataCap = validateIssueDataCap
