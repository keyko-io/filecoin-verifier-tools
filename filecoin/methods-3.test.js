import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'

const bytes = json.encode({ hello: 'world' })

const hash = await sha256.digest(bytes)
const cid = CID.create(1, json.code, hash)

describe('genral test', () => {
   it("should be ok", async () => {

      const bytes = json.encode({ hello: 'world' })

      const hash = await sha256.digest(bytes)
      const cid = CID.create(1, json.code, hash)

      expect(cid).toBeTruthy()
   })
})

// describe("Sum numbers", () => {
//   test("it should sum two numbers correctly", () => {
//     const sum = 1 + 2;
//     const expectedResult = 3;
//     expect(sum).toEqual(expectedResult);
//   })
// });