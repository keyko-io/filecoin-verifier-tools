const ownerName = /[\n\r][ \t]*###\s*Data\s*Owner\s*Name[\n\t]*([^\n\r]*)/;
const webSite = /[\n\r][ \t]*###\s*Website[\n\t]*([^\n\r]*)/;
const ownerCountry =
  /[\n\r][ \t]*###\s*Data\s*Owner\s*Country[\n\t]*([^\n\r]*)/;
const total =
  /[\n\r][ \t]*###\s*Total\s*amount\s*of\s*DataCap\s*being\s*requested[\n\t]*([^\n\r]*)/;
const weekly =
  /[\n\r][ \t]*###\s*Weekly\s*allocation\s*of\s*DataCap\s*requested[\n\t]*([^\n\r]*)/;
const onchain =
  /[\n\r][ \t]*###\s*On-chain\s*address\s*for\s*first\s*allocation[\n\t]*([^\n\r]*)/;

function matchGroupLargeNotary(regex, content) {
  let m;
  //console.log(regex.exec(content))
  if ((m = regex.exec(content)) !== null) {
    if (m.length >= 2) {
      return m[1].trim();
    }
    return m[0].trim();
  }
}

const issueContent = `
### Website

www.test.com
`;

//const name = matchGroupLargeNotary(ownerName, issueContent)
//const country = matchGroupLargeNotary(ownerCountry, issueContent)
const websiteInfo = matchGroupLargeNotary(webSite, issueContent);

//console.log(name);
//console.log(country);
console.log(websiteInfo);
