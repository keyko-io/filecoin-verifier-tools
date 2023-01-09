import axios from "axios";

const baseURL = "https://api.filplus.d.interplanetary.one/api/storeBotEvent";
const botEnvironment = process.env.METRICS_API_ENVIRONMENT || "test";

export async function callMetricsApi(
  issueNumber: number,
  eventType: any,
  params: any,
  environment?: string
) {
  const req = {
    environment: environment || botEnvironment,
    repo: "large-dataset",
    issueNumber,
    timeStamp: new Date(),
    eventType,
    params,
  };
  //  console.log('req', req)
  try {
    const res = await axios.post(baseURL, req);
    console.log("metrics data res", res.data);
  } catch (error) {
    console.error(error);
  }
}
