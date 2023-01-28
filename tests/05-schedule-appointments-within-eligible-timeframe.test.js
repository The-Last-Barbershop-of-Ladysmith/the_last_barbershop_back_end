const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

describe("03 - Appointments Are Made Within An Eligible Timeframe", () => {
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

    describe("App", async () => {

        describe("not found handler", () => {

            test("returns 404 for non-existent route", async () => {
                const response = await request(app)
                    .get("/fastidious")
                    .set("Accept", "application/json");

                expect(response.status).toBe(404);
                expect(response.body.error).toBe("Path not found: /fastidious");
            });

        })
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
                    .send({data})

                expect(response.status).toBe(400)
                expect(response.body.error).toContain("future")

            })

            test("returns 400 for appointment scheduled for a 1 hour before the current time", async () => {

                

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
                    .send({data})

                expect(response.status).toBe(400)
                expect(response.body.error).toContain("future")

            })

        });
    })
})