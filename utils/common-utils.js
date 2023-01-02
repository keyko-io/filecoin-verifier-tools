
// used in large-issue-parser and notary-issue-parser
export function matchGroupLargeNotary(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 2) {
      return m[1].trim()
    }
    return m[0].trim()
  }
}
// used is issue-parser.js
export function matchGroup(regex, content) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 1) { return m[1].trim() }
  }
}

export function matchAll(regex, content) {
  const matches = [...content.matchAll(regex)]
  if (matches !== null) {
    // each entry in the array has this form: Array ["#### Address > f1111222333", "", "f1111222333"]
    return matches.map(elem => elem[2])
  }
}

