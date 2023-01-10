import * as main from './index'

describe('test main package', () => {
  it('test api package', () => {
    console.log(main.VerifyAPI)
    expect(main.VerifyAPI).toBeTruthy()
  })
  it('test methods package', () => {
    console.log(main.methods.testnet.ROOTKEY)
    expect(main.methods.testnet).toBeTruthy()
  })
  it('test large-issue-parser package', () => {
    expect(main.ldnParser).toBeTruthy()
  })
  it('test notary-issue-parser package', () => {
    expect(main.notaryParser).toBeTruthy()
  })
  it('test metrics package', () => {
    expect(main.metrics).toBeTruthy()
  })
  it('test simple client package', () => {
    expect(main.simpleClientParser).toBeTruthy()
  })
  it('test common-utils package', () => {
    expect(main.commonUtils).toBeTruthy()
  })
})
