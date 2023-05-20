const knex = require("../db/connection");
const { TABLE_NAME: APPOINTMENTS_TABLE } = require('../utils/string-constants').APPOINTMENTS

function create(newAppointment){
    return knex(APPOINTMENTS_TABLE)
        .insert(newAppointment, "*")
        .then((data) => data[0])
}

module.exports = {
    create
}