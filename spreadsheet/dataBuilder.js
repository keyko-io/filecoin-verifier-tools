const {
  parseReleaseRequest,
  parseIssue,
} = require('../utils/large-issue-parser')

const commentsForEachIssue = async (octokit, rawIssues) => {
  try {
    return await Promise.all(
      rawIssues.map(async (issue) => {
        const comments = await octokit.paginate(octokit.rest.issues.listComments,
          {
            owner: process.env.GITHUB_LDN_REPO_OWNER,
            repo: process.env.GITHUB_LDN_REPO,
            issue_number: issue.number,
          })
        return { issueNumber: issue.number, comments }
      }))
  } catch (error) {
    console.log('error in dataBuilder commentsForEachIssue', error)
  }
}

const prepareObject = async (octokit, rawIssues) => {
  try {
    const commentsEachIssue = await commentsForEachIssue(octokit, rawIssues)
    const spreadsheetDataArray =
            await Promise.all(
              rawIssues.map(async (issue) => {
                const { number, body, title, labels, user, state, assignee, created_at, updated_at, closed_at } = issue

                const parsedIssue = parseIssue(body)
                let msigAddress = ''
                let requestCount = 0
                let comment = {}
                const issueCommentsAndNumber = commentsEachIssue.find((item) => item.issueNumber === number)
                for (comment of issueCommentsAndNumber.comments) {
                  const msigComment = await parseReleaseRequest(comment.body)
                  if (msigComment.correct) {
                    msigAddress = msigComment.notaryAddress
                    requestCount++
                  }
                }

                const spreadsheetData = {
                  issueNumber: number,
                  status: labels ? labels.map((label) => label.name).toString() : '',
                  author: user ? user.login : '',
                  title,
                  isOpen: state === 'open' ? 'yes' : 'no',
                  assignee: assignee ? assignee.login : '',
                  created_at,
                  updated_at,
                  closed_at: closed_at || '',
                  clientName: parsedIssue ? parsedIssue.name : '',
                  clientAddress: parsedIssue ? parsedIssue.address : '',
                  msigAddress,
                  totalDataCapRequested: parsedIssue ? parsedIssue.datacapRequested : '',
                  weeklyDataCapRequested: parsedIssue ? parsedIssue.dataCapWeeklyAllocation : '',
                  numberOfRequests: String(requestCount),

                }
                return spreadsheetData
              }),
            )
    return spreadsheetDataArray
  } catch (error) {
    console.log('error in dataBuilder prepareObject', error)
  }
}

exports.prepareObject = prepareObject
