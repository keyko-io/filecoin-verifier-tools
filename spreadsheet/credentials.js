
const formatPK = () => {
  const BEGIN = process.env.BEGIN_KEY_SPREADSHEET
  const END = process.env.END_KEY_SPREADSHEET
  const splitted = process.env.PRV_KEY_SPREADSHEET.match(/.{1,64}/g)
  const formatted = `${BEGIN}\n${splitted.join('\n')}\n${END}`
  return formatted
}

const credentials = {
  type: process.env.TYPE_SPREADSHEET,
  project_id: process.env.PRJ_ID_SPREADSHEET,
  private_key_id: process.env.PRV_KEY_ID_SPREADSHEET,
  private_key: formatPK(),
  client_email: process.env.CLIENT_EMAIL_SPREADSHEET,
  client_id: process.env.CLIENT_ID_SPREADSHEET,
  auth_uri: process.env.AUTH_URI_SPREADSHEET,
  token_uri: process.env.TOKEN_URI_SPREADSHEET,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL_SPREADSHEET,
  client_x509_cert_url: process.env.CLIENT_CERT_URL_SPREADSHEET,
}

exports.credentials = credentials
