const knex = require("../db/connection");
const { APPOINTMENTS_TABLE } = require('../utils/string-constants')

function create(newAppointment){
    return knex(APPOINTMENTS_TABLE)
        .insert(newAppointment, "*")
        .then((data) => data[0])
}

module.exports = {
    create
}