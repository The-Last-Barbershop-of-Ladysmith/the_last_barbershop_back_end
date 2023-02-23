const bcrypt = require('bcrypt')

const generateHashedPassword = async (password) => {
    return await bcrypt.hashSync(password,10)
}

module.exports = {
    generateHashedPassword
}