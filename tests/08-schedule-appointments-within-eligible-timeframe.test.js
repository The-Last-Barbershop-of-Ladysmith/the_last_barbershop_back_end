const request = require("supertest");
const app = require("../src/app");
const knex = require("../src/db/connection");
const { formatDateObjAsDateString, formatDateObjAsTimeString } = require('./utils/date-time')

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
    let businessDay
    const RealDate = Date.now;

    beforeAll(() => {
        // Set system time for test to be 3/7/2023 10:00 AM
        jest.setSystemTime(new Date("2023-03-07T10:00:00").getTime());
        return knex.migrate
            .forceFreeMigrationsLock()
            .then(() => knex.migrate.rollback(null, true))
            .then(() => knex.migrate.latest());
    });

    beforeEach(async () => {
        await knex.seed.run();
        // Get the businessDay info for the next day 
        businessDay = await knex('business_days').where("day_value", new Date("2023-03-07T10:00:00").getDay()).first()
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
                start_time: "12:00",
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

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2023-03-07",
                start_time: "10:30",
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

        test("Returns 400 for appointment scheduled before shop opens", async () => {

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2023-03-08",
                start_time: "09:30",
                people: 1,
            };

            const response = await request(app)
                .post("/appointments")
                .set("Accept", "application/json")
                .set("x-csrf-token", csrfResponse.body.data || null)
                .set("Cookie", csrfResponse.headers["set-cookie"] || null)
                .send({ data });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("open");
        });

        test("Returns 400 for appointment scheduled after shop closes", async () => {

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2023-03-08",
                start_time: "5:30",
                people: 1,
            };

            const response = await request(app)
                .post("/appointments")
                .set("Accept", "application/json")
                .set("x-csrf-token", csrfResponse.body.data || null)
                .set("Cookie", csrfResponse.headers["set-cookie"] || null)
                .send({ data });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("closed");
        });

        test("Returns 400 for appointment scheduled less than 30 min before shop closes", async () => {

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2023-03-08",
                start_time: "04:30",
                people: 1,
            };

            const response = await request(app)
                .post("/appointments")
                .set("Accept", "application/json")
                .set("x-csrf-token", csrfResponse.body.data || null)
                .set("Cookie", csrfResponse.headers["set-cookie"] || null)
                .send({ data });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("closes");
        });

        test("Returns 400 for appointment scheduled during a lunch break", async () => {

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2023-03-08",
                start_time: "01:30",
                people: 1,
            };

            const response = await request(app)
                .post("/appointments")
                .set("Accept", "application/json")
                .set("x-csrf-token", csrfResponse.body.data || null)
                .set("Cookie", csrfResponse.headers["set-cookie"] || null)
                .send({ data });

            expect(response.status).toBe(400);
        });

        test("Returns 400 for appointment scheduled on a date that is blocked", async () => { 
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2023-03-10",
                start_time: "02:30",
                people: 1,
            };

            const response = await request(app)
                .post("/appointments")
                .set("Accept", "application/json")
                .set("x-csrf-token", csrfResponse.body.data || null)
                .set("Cookie", csrfResponse.headers["set-cookie"] || null)
                .send({ data });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("unavailable");
        });
        test("Returns 400 for appointment not scheduled on 30 min intervals", async ()=>{
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2023-03-10",
                start_time: "02:45",
                people: 1,
            };

            const response = await request(app)
                .post("/appointments")
                .set("Accept", "application/json")
                .set("x-csrf-token", csrfResponse.body.data || null)
                .set("Cookie", csrfResponse.headers["set-cookie"] || null)
                .send({ data });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("30");
        })
        test("Returns 400 for appointment scheduled on time slot already booked", async () =>{
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2026-12-30",
                start_time: "12:00",
                people: 1,
            };

            const response = await request(app)
                .post("/appointments")
                .set("Accept", "application/json")
                .set("x-csrf-token", csrfResponse.body.data || null)
                .set("Cookie", csrfResponse.headers["set-cookie"] || null)
                .send({ data });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("unavailable");
        })
        test("Returns 400 for appointmen scheduled while another appointment is to be in progress")
    });
});
