function parseOldLDN(issueContent) {
//   - Organization Name: TVCC
// - Website / Social Media: www.wow.com
// - Region: Asia excl. Japan
// - Total amount of DataCap being requested (between 500 TiB and 5 PiB): 1PiB
// - Weekly allocation of DataCap requested (usually between 1-100TiB): 10TiB
// - On-chain address for first allocation: f3tbfu6dptaui5uwdt7tlhzmovocz47z2fv34dewwhvkf6heel63zqv6ro7we5fvfzndmofel64dggk5vdr5rq
// - Type: Custom Notary
// - Identifier: E-fil
  const data = {
    name: "Organization Name",
    region: "Website / Social Media",
    website: "Media",
    datacapRequested: "Total amount of DataCap being requested \(between 500 TiB and 5 PiB\)",
    dataCapWeeklyAllocation: "Weekly allocation of DataCap requested (usually between 1-100TiB)",
    address: "On-chain address for first allocation",
    isCustomNotary: "Custom Notary",
    identifier: "Identifier",
  }
  const regexForAdress = /^(f1|f3)/

  const parsedData = {
    correct: true,
    errorMessage: '',
    errorDetails: '',
  }

  const trimmed = issueContent.replace(/(\n)|(\r)/gm, '')
  console.log("trimmed",trimmed)

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${v}:)(.*?)(?=-)$`)
    //TODO improve regex or make a conditional for Identifier field
   
  }

  return parsedData
}

exports.parseOldLDN = parseOldLDN
