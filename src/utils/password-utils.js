const bcrypt = require('bcrypt')

const generatePassword = async (password) => {
    return await bcrypt.hashSync(password,10)
}

module.exports = {
    generatePassword
}