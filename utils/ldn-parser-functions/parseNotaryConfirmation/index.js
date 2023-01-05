export function parseNotaryConfirmation(commentContent, title) {
  const result = title.match(/#(\d+)/)

  const confirmationText = '## The request has been signed by a new Root Key Holder'

  const confirmationMessage = commentContent.includes(confirmationText)

  if (!result) {
    return {
      errorMessage: 'no title found',
      confirmationMessage,
    }
  }

  return {
    confirmationMessage,
    number: Number(result[1]),
  }
}
