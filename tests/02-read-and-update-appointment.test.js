const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

/** TODO - Add tests to ensure appointment is not scheduled for a date already booked */

/** CSRF protection does not yet need to be implemented for test to pass
 * app requests will be built to conditionally set csrf cookie and auth header if GET route /csrf returns the tokens
 * All PUT, POST, DELETE requests will need to use CSRF protection once implemented
 * Test for correct implementation of CSRF token will be handled on test 4
 */

describe("02 - Read and Update Appointments", () => {
  beforeAll(() => {
    return knex.migrate
      .forceFreeMigrationsLock()
      .then(() => knex.migrate.rollback(null, true))
      .then(() => knex.migrate.latest());
  });

  beforeEach(() => {
    return knex.seed.run();
  });

  afterAll(async () => {
    return await knex.migrate.rollback(null, true).then(() => knex.destroy());
  });

  describe("GET /appointments/:appointment_id", () => {
    test("returns 404 for non-existent id", async () => {
      const response = await request(app)
        .get("/appointment/99")
        .set("Accept", "application/json");

      expect(response.body.error).toContain("99");
      expect(response.status).toBe(404);
    });

    test("returns 200 for existing id", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const response = await request(app)
        .get(appointmentURL)
        .set("Accept", "application/json");

      expect(response.body.error).toContain("admin_id");
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          first_name: "Mouse",
          last_name: "Whale",
          mobile_number: "800-555-1212",
          appointment_date: expect.stringContaining("2026-12-30"),
          appointment_time: expect.stringContaining("12:00"),
          people: 2,
        })
      );
    });
  });

  describe("PUT /appointments/:appointment_id", async () => {
    let appointment;
    let csrfResponse;

    beforeEach(async () => {
      appointment = await knex("appointments")
        .where({ mobile_number: "800-555-1212", status: "booked" })
        .first();
      csrfResponse = await request(app)
        .get("/csrf")
        .set("Accept", "application/json");
    });

    test("returns 404 if appointment_id is non-existent", async () => {
      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "800-555-1212",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put("/appointment/99")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("99");
      expect(response.status).toBe(404);
    });

    test("returns 400 if data missing", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ datum: {} });

      expect(response.body.error).toBeUndefined();
      expect(response.status).toBe(400);
    });

    test("returns 400 if first_name is missing", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        last_name: "Whale",
        mobile_number: "800-555-1212",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("first_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if first_name is empty", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "",
        last_name: "Whale",
        mobile_number: "800-555-1212",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("first_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if last_name is missing", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        mobile_number: "800-555-1212",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("last_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if last_name is empty", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "",
        mobile_number: "800-555-1212",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("last_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is missing", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is empty", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;
      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is not a string matching format ^d{3}-d{3}-d{4}$", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "1234567890",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is not a string of numbers", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "abcdefghij",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is not a string not length of 10", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "123456",
        appointment_date: "2026-12-30",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_date is missing", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "1234567890",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("appointment_date");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_date is empty", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "1234567890",
        appointment_date: "",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("appointment_date");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_date is not a date in format YYYY-MM-DD", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "1234567890",
        appointment_date: "not-a-date",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("appointment_date");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_time is missing", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "1234567890",
        appointment_date: "2026-12-30",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("appointment_time");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_time is empty", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "1234567890",
        appointment_date: "2026-12-30",
        appointment_time: "",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("appointment_time");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_time is not a time format HH:MM", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "Mouse",
        last_name: "Whale",
        mobile_number: "1234567890",
        appointment_date: "2026-12-30",
        appointment_time: "not-a-time",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("appointment_time");
      expect(response.status).toBe(400);
    });

    test("returns 400 if people is missing", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "12:00",
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("people");
      expect(response.status).toBe(400);
    });

    test("returns 400 if people is less than 1", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "12:00",
        people: 0,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("people");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment status is not booked", async () => {
      const cancelledAppointment = await knex("appointments")
        .where({ mobile_number: "800-555-1212", status: "cancelled" })
        .first();

      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "12:00",
        people: 1,
      };

      const response = await request(app)
        .put(`/appointments/${cancelledAppointment.appointment_id}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("status");
      expect(response.status).toBe(400);
    });

    test("returns 400 if people is not a number", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "12:00",
        people: "2",
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("people");
      expect(response.status).toBe(400);
    });

    test("returns 200 if data is valid", async () => {
      const appointmentURL = `/appointments/${appointment.appointment_id}`;

      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "12:00",
        people: 2,
      };

      const response = await request(app)
        .put(appointmentURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toEqual(
        expect.objectContaining({
          first_name: "first",
          last_name: "last",
          mobile_number: "800-555-1212",
          appointment_date: expect.stringContaining("2025-01-01"),
          appointment_time: expect.stringContaining("12:00"),
          people: 2,
        })
      );
      expect(response.status).toBe(200);
    });
  });
});
