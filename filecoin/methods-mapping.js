// look here for the other methods: https://github.com/filecoin-project/specs-actors/blob/v5.0.4/actors/builtin/methods.go

const methods_map = {
  Propose: 2,
  Approve: 3,
  Cancel: 4,
  AddSigner: 5,
  RemoveSigner: 6,
  SwapSigner: 7,
  ChangeNumApprovalsThreshold: 8,
  LockBalance: 9,
}

module.exports = {
  msigMethods: methods_map,
}
