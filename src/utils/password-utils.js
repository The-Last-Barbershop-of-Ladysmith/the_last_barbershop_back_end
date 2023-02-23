const bcrypt = require('bcrypt')

const generateHashedPassword = async (password) => {
    return await bcrypt.hashSync(password, 10)
}

/**
 * Checks if hashed password matches a password given
 * @param {string} reqPassword - password recieved in request body
 * @param {string} dbPassword - hashed password stored in db
 * @returns {boolean} Boolean describing if passwords match 
 */
const validPassword = async (reqPassword, dbPassword) => {
    return await bcrypt.compareSync(reqPassword, dbPassword)
}

module.exports = {
    generateHashedPassword, 
    validPassword
}