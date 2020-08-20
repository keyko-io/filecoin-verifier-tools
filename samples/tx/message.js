
const Sequelize = require('sequelize')

exports.message = {
    version: "int",
    to_address: "address",
    from_address: "address",
    nonce: "int",
    value: "bigint",
    gas_limit: "int",
    gas_feecap: "bigint",
    gas_premium: "bigint",
    method: "int",
    params: "buffer",
}

exports.block = {
    height: {
        type: Sequelize.INTEGER
    },
    blockhash: {
        type: Sequelize.STRING
    },
    timestamp: {
        type: Sequelize.DECIMAL(100)
    },
    miner: {
        type: Sequelize.STRING
    },
    parentweight: {
        type: Sequelize.DECIMAL(100)
    },
}

exports.db = {
    height: {
        type: Sequelize.INTEGER
    },
    txhash: {
        type: Sequelize.STRING
    },
    blockhash: {
        type: Sequelize.STRING
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
    gas_feecap: {
        type: Sequelize.DECIMAL(100)
    },
    gas_premium: {
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
