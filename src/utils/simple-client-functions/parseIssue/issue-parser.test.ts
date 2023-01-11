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
    expect(parsedResult.name).toBe("Strong  HUman  VICtory");
    expect(parsedResult.address).toBe("f1raq3tbv6k2keotawldn2gmf5ygxu2n72dohfsji");
    expect(parsedResult.datacap).toBe("50TiB");
    expect(parsedResult.website).toContain("http://shuvic.kro.kr");
    expect(parsedResult.notary).toBe("IreneYoung");
    console.log(parsedResult.region)
    expect(parsedResult.region).toBe("Asia excl. Greater China");
  });
});
