/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("appointments", (table) => {
      table.uuid("appointment_id").primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("mobile_number").notNullable();
      table.string("appointment_date").notNullable();
      table.time("appointment_time").notNullable();
      table.integer("people").notNullable();
      table.string("status").notNullable();
      table.timestamps(true, true);
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('appointments');
  };
  