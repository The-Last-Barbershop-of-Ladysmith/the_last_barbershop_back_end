const request = require("supertest");
const app = require("../src/app");
const knex = require("../src/db/connection");

/** CSRF protection does not yet need to be implemented for test to pass
 * app requests will be built to conditionally set csrf cookie and auth header if GET route /csrf returns the tokens
 * All PUT, POST, DELETE requests will need to use CSRF protection once implemented
 * Test for correct implementation of CSRF token will be handled on test 4
 */

// Tell Jest to use a different timer implementation. You can also
// configure this in your jest.config.js file. For more info see
// https://jestjs.io/docs/en/configuration#timers-string).
jest.useFakeTimers("modern");

describe("03 - Appointments Are Made Within An Eligible Time frame", () => {
  let csrfResponse;
  const RealDate = Date.now;

  beforeAll(() => {
    // Set system time for test to be 3/7/2023 10:00 AM
    jest.setSystemTime(new Date("2023-03-07T10:00:00Z").getTime());
    return knex.migrate
      .forceFreeMigrationsLock()
      .then(() => knex.migrate.rollback(null, true))
      .then(() => knex.migrate.latest());
  });

  beforeEach(async () => {
    await knex.seed.run();
    csrfResponse = await request(app)
      .get("/csrf")
      .set("Accept", "application/json");
  });

  afterAll(async () => {
    // Return to real time
    jest.useRealTimers();
    return await knex.migrate.rollback(null, true).then(() => knex.destroy());
  });

  describe("POST /appointments", () => {
    test("returns 400 for appointment scheduled for a date in the past", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "1989-01-01",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("future");
    });

    test("returns 400 for appointment scheduled less than 1 hour in advance", async () => {
      // Create date object of 30 min past system time
      const scheduleDate = new Date("2023-03-07T10:30:00Z");
      // Get date formatted in string that matches PostgreSQL format
      const appointmentDate = scheduleDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      // Get time formatted in string that matches PostgreSQL format
      const appointmentTime = scheduleDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("future");
    });

    test("Returns 400 for appointment scheduled before shop opens", async () => {});

    test("Returns 400 for appointment scheduled less than 30 min before shop closes", async () => {});

    test("Returns 400 for appointment scheduled during a lunch break", async () => {});

    test("Returns 400 for appointment scheduled on a date that is blocked", async () => {});
  });
});
