const axios = require('axios')
const baseURL = 'https://api.filplus.d.interplanetary.one/api/storeBotEvent'
async function callMetricsApi(issueNumber, eventName, eventMetadata) {
  const req = {
    environment: process.env.METRICS_API_ENVIRONMENT || 'test',
    issueNumber,
    repo: 'large-dataset',
    timeStamp: new Date(),
    eventName,
    eventMetadata,
  }
  console.log('req', req)
  try {
    const res = await axios.post(baseURL, req)
    console.log(res)
  } catch (error) {
    console.error(error)
  }
}

exports.callMetricsApi = callMetricsApi
