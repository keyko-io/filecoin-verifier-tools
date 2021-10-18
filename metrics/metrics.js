const axios = require('axios')
const baseURL = 'https://api.filplus.d.interplanetary.one/api/storeBotEvent'
const botEnvironment = process.env.METRICS_API_ENVIRONMENT || 'test'
async function callMetricsApi(issueNumber, eventType, params, environment) {
  const req = {
    environment: environment || botEnvironment,
    repo: 'large-dataset',
    issueNumber,
    timeStamp: new Date(),
    eventType,
    params,
  }
  //  console.log('req', req)
  try {
    await axios.post(baseURL, req)
    // console.log(res)
  } catch (error) {
    console.error(error)
  }
}

exports.callMetricsApi = callMetricsApi
