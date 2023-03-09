const business_hours = require("./03-business_hours.json")

exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE appointments RESTART IDENTITY CASCADE")
    .then(function () {
      return knex("business_hours").insert(business_hours);
    });
};