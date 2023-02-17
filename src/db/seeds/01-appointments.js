const appointments = require("./01-appointments.json");

exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE appointments RESTART IDENTITY CASCADE")
    .then(function () {
      return knex("appointments").insert(appointments);
    });
};
