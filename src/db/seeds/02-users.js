const users = require("./02-users.json");
const { generateHashedPassword } = require("../../utils/password-utils");

/** Create array of user objects including a hashed password
 * @returns {<Promise> {user_name: string, mobile_number: String, role:string, password:string }[]} 
 */
const getAdminsWithPassword = async () => {
  const password = await generateHashedPassword(process.env.SEED_PASSWORD);
  return users.map((user) => (user = { ...user, password }));
};

exports.seed = (knex) => {
  return (
    // Deletes ALL existing entries
    knex
      .raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
      // Generate array of users with hashed password
      .then(getAdminsWithPassword)
      // Insert seed entries
      .then((data) => knex("users").insert(data))
  );
};
