
function callMetricsApi(issueNumber, eventType, params) {
    const req = {
        environment: process.env.METRICS_API_ENVIRONMENT || "test",
        issueNumber,
        repo: "large-dataset",
        timeStamp: new Date,
        eventType,
        params
    }
    // const res = "functioning sofar"
    console.log(req)
    // const res =  axios.post(baseURL, req)
    // console.log()
    // return res
}

exports.callMetricsApi = callMetricsApi