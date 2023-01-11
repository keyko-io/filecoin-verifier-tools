interface parseIssueData {
    correct: boolean;
    errorMessage: string;
    errorDetails?: string;
    name?: boolean;
    website?: string;
    notary?: string;
    region?: string;
    address?: string;
    datacap?: string;
}

/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable quotes */
export function parseIssue(issueContent: string) {
  const data = {
    name: "Name",
    address: "Addresses to be Notarized",
    datacap: "DataCap Requested",
    website: "Website \\/ Social Media",
    notary: "Notary Requested",
    region: "Region",
  };

  const parsedData : parseIssueData = {
    correct: true,
    errorMessage: "",
    errorDetails: "",
  };

  const trimmed = issueContent.replace(/(\n)|(\r)/gm, "");

  for (const [key, value] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${value}:)(.*?)(?=-)`);

    const result = trimmed?.match(rg)[0].trim() || null;

    const resultIsNull = !result || !result.length;

    if (resultIsNull) {
      parsedData.correct = false;
      parsedData.errorMessage += `We could not find **${value}** field in the information provided\n`;
      continue;
    }

    parsedData[key] = result || null;
  }

  return parsedData;
}
