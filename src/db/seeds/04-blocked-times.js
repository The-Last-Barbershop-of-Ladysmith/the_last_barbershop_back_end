const blocked_times = require("./04-blocked-times.json")
exports.seed = function(knex) {

  const addAdminToBlockedDates = async () =>{
    const blocked_by = await knex('admins').select('admin_id').where({admin_name: "John"}).first()
    return blocked_times.map((block_time)=>block_time = {...block_time, blocked_by})
  }

  return (
    // Deletes ALL existing entries
    knex
      .raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
      // Generate array of users with hashed password
      .then(addAdminToBlockedDates)
      // Insert seed entries
      .then((data) => knex("admins").insert(data))
  );
};
