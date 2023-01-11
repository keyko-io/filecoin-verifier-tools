/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable quotes */
import { readFileSync } from "fs";
import path, { dirname, resolve } from "path";
import { parseIssue } from "./index";
const __dirname = path.resolve();

describe("parse simple client()", () => {
  it("we can parse trigger comment correctly", () => {
    const issueContent = readFileSync(
      resolve(__dirname, "./src/samples/utils/client_allocation_request.test.md"),
      { encoding: "utf8" }
    );

    const parsedResult = parseIssue(issueContent);

    expect(parsedResult.correct).toBe(true);
    expect(parsedResult.name).toBe("Protocol Labs");
    expect(parsedResult.address).toBe("t0231874218");
    expect(parsedResult.datacap).toBe("10TiB");
    expect(parsedResult.website).toContain("https://protocol.ai/");
    expect(parsedResult.notary).toBe("notaryuser");
    expect(parsedResult.region).toBe("Europe");
  });
});
