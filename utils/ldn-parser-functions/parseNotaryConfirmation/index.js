/* eslint-disable indent */
const { matchGroupLargeNotary } = require('../../common-utils')

function parseNotaryConfirmation(commentContent, title) {
    const regexConfirmation = /##\s*The\s*request\s*has\s*been\s*signed\s*by\s*a\s*new\s*Root\s*Key\s*Holder/m
    const regexTitleNumber = /Large\sdataset\smultisig\srequest\s#\s*([0-9]*)/m

    const confirmation = matchGroupLargeNotary(regexConfirmation, commentContent)
    const number = Number([...title.match(regexTitleNumber)][1])

    if (confirmation == null) {
        return {
            confirmationMessage: false,
        }
    } else {
        return {
            confirmationMessage: true,
            number,
        }
    }
}
exports.parseNotaryConfirmation = parseNotaryConfirmation
