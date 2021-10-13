const axios = require('axios')
const baseURL = 'https://api.filplus.d.interplanetary.one/api/storeBotEvent'
const environment = process.env.REACT_APP_METRICS_API_ENVIRONMENT ? "prod" : "test"
  async function callMetricsApi(issueNumber, eventName, eventMetadata) {
    const req = {
      environment,
      issueNumber,
      repo: 'large-dataset',
      timeStamp: new Date(),
      eventName,
      eventMetadata,
    }
    // console.log('req', req)
    try {
      const res = await axios.post(baseURL, req)
      // console.log(res)
    } catch (error) {
      console.error(error)
    }
  }

exports.callMetricsApi = callMetricsApi
