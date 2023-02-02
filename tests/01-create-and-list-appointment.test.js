const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

describe("01 - Create and List Appointments", () => {
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

  describe("App", () => {
    describe("not found handler", () => {
      test("returns 404 for non-existent route", async () => {
        const response = await request(app)
          .get("/fastidious")
          .set("Accept", "application/json");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Path not found: /fastidious");
      });
    });
  });

  describe("POST /appointments", () => {
                                                                                                     
    test("returns 400 if data is missing", async () => {
      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ datum: {} });

      expect(response.body.error).toBeDefined();
      expect(response.status).toBe(400);
    });

    test("returns 400 if first_name is missing", async () => {
      const data = {
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("first_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if first_name is empty", async () => {
      const data = {
        first_name: "",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("first_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if last_name is missing", async () => {
      const data = {
        first_name: "first",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("last_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if last_name is empty", async () => {
      const data = {
        first_name: "first",
        last_name: "",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("last_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is missing", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        appointment_date: "2025-01-01",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_phone is empty", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "",
        appointment_date: "2025-01-01",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is not a string matching format ^\d{3}-\d{3}-\d{4}$", async ()=>{
        const data = {
            first_name: "Mouse", 
            last_name: "Whale", 
            mobile_number: "1234567890",
            appointment_date: "2026-12-30", 
            appointment_time: "12:00", 
            people: 2
        }

        const response = await request(app)
            .post("/appointments")
            .set("Accept", "application/json")
            .send({data})

        expect(response.body.error).toContain("mobile_number")
        expect(response.status).toBe(400)
    })

    test("returns 400 if appointment_date is missing", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("appointment_date");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_date is empty", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("appointment_date");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_date is not a date in format YYYY-MM-DD", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "not-a-date",
        appointment_time: "13:30",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("appointment_date");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_time is missing", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("appointment_time");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_time is empty", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("appointment_time");
      expect(response.status).toBe(400);
    });

    test("returns 400 if appointment_time is not a time in format HH:MM", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "not-a-time",
        people: 1,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("appointment_time");
    });

    test("returns 400 if people is missing", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "17:30",
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("people");
      expect(response.status).toBe(400);
    });

    test("returns 400 if people is less than 1", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "17:30",
        people: 0,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("people");
      expect(response.status).toBe(400);
    });

    test("returns 400 if people is not a number", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "17:30",
        people: "2",
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("people");
      expect(response.status).toBe(400);
    });

    test("returns 201 if data is valid", async () => {
      const data = {
        first_name: "first",
        last_name: "last",
        mobile_number: "800-555-1212",
        appointment_date: "2025-01-01",
        appointment_time: "17:30",
        people: 2,
      };

      const response = await request(app)
        .post("/appointments")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toEqual(
        expect.objectContaining({
          first_name: "first",
          last_name: "last",
          mobile_number: "800-555-1212",
          appointment_date: expect.stringContaining("2025-01-01"),
          appointment_time: expect.stringContaining("17:30"),
          people: 2,
        })
      );
      expect(response.status).toBe(201);
    });

    test("updates appointments status to book once submitted", async () => {
        const data = {
          first_name: "first",
          last_name: "last",
          mobile_number: "800-555-1212",
          appointment_date: "2025-01-01",
          appointment_time: "17:30",
          people: 2,
        };
  
        const response = await request(app)
          .post("/appointments")
          .set("Accept", "application/json")
          .send({ data });
  
        expect(response.body.error).toBeUndefined();
        expect(response.body.data.status).toEqual("booked");
        expect(response.status).toBe(201);
      });

  });
});
