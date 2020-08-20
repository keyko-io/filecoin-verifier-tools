const lotus_endpoint = "http://localhost:1234/rpc/v0"
const token_path = `${process.env.HOME}/.lotus/token`
const postgres_conn_url = 'postgres://postgres:1234@localhost:5432/lotus'

module.exports = {
    lotus_endpoint: lotus_endpoint,
    token_path: token_path,
    postgres_conn_url: postgres_conn_url
}