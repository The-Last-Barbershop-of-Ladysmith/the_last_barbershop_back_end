const admins = require("./02-admins.json");

const {generateHashedPassword} = require('../../utils/password-utils')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex
    .raw("TRUNCATE TABLE admins RESTART IDENTITY CASCADE")
    .then(function () {
      // Add hashed password for each Admin
      const adminsWithPassword = admins.forEach((admin)=>{
        const password = generateHashedPassword(process.env.SEED_PASSWORD)
        return {
          admin, 
          ...password
        }
      })
      return knex("admins").insert(adminsWithPassword);
    });
};
