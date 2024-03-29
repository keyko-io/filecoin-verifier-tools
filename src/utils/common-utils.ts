
// used in large-issue-parser and notary-issue-parser
export function matchGroupLargeNotary(regex: any, content: string) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 2) {
      return m[1].trim()
    }
    return m[0].trim()
  }
}
// used is issue-parser.js
export function matchGroup(regex: any, content: string) {
  let m
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 1) { return m[1].trim() }
  }
}


export const regexForAdress = /^(f1|f2|f4|f3)/
