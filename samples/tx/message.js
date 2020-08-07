
const Sequelize = require('sequelize')

exports.message = {
    version: "int",
    to_address: "address",
    from_address: "address",
    nonce: "int",
    value: "bigint",
    gas_price: "bigint",
    gas_limit: "int",
    method: "int",
    params: "buffer",
}

exports.db = {
    height: {
        type: Sequelize.INTEGER
    },
    version: {
        type: Sequelize.INTEGER
    },
    to_address: {
        type: Sequelize.STRING
    },
    from_address: {
        type: Sequelize.STRING
    },
    nonce: {
        type: Sequelize.INTEGER
    },
    value: {
        type: Sequelize.DECIMAL(100)
    },
    gas_price: {
        type: Sequelize.DECIMAL(100)
    },
    gas_limit: {
        type: Sequelize.BIGINT
    },
    method: {
        type: Sequelize.INTEGER
    },
    params: {
        type: Sequelize.BLOB
    },
}
