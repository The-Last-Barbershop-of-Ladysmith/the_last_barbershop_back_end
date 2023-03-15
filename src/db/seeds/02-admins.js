const admins = require("./02-admins.json");
const { generateHashedPassword } = require("../../utils/password-utils");

/** Create array of user objects including a hashed password */
const getAdminsWithPassword = async () => {
  const password = await generateHashedPassword(process.env.SEED_PASSWORD);
  return admins.map((admin) => (admin = { ...admin, password }));
};

exports.seed = (knex) => {
  return (
    // Deletes ALL existing entries
    knex
      .raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
      // Generate array of users with hashed password
      .then(getAdminsWithPassword)
      // Insert seed entries
      .then((data) => knex("admins").insert(data))
  );
};
