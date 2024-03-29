const request = require("supertest");
const app = require("../src/app");
const knex = require("../src/db/connection");
const {
  generateHashedPassword,
  validPassword,
} = require("../src/utils/password-utils");

describe("01 - Create Read and Update users", () => {
  /**users table will have the following structure
   * user_id - uuid - primary key
   * user_name - string - name user would like to go by
   * mobile_number - string - pattern [^\d{3}-\d{3}-\d{4}$] - user contact number that will be used as login "username"
   * password - string - login password.  hashed password will be saved in db
   * role - string - current role of user.  Should be user or terminated
   */

  /** CSRF protection does not yet need to be implemented for test to pass
   * app requests will be built to conditionally set csrf cookie and auth header if GET route /csrf returns the tokens
   * All PUT, POST, DELETE requests will need to use CSRF protection once implemented
   * Test for correct implementation of CSRF token will be handled on test 4
   */

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

  describe("POST /users", () => {
    let csrfResponse;

    beforeEach(async () => {
      csrfResponse = await request(app)
        .get("/csrf")
        .set("Accept", "application/json");
    });

    test("returns 400 if data is missing", async () => {
      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ datum: {} });

      expect(response.body.error).toBeDefined();
      expect(response.status).toBe(400);
    });

    test("returns 400 if user_name is empty", async () => {
      const data = {
        user_name: "",
        mobile_number: "123-456-7890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("user_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if user_name is missing", async () => {
      const data = {
        mobile_number: "123-456-7890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("user_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is empty", async () => {
      const data = {
        user_name: "John",
        mobile_number: "",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is missing", async () => {
      const data = {
        user_name: "John",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error), toContain("mobile-number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile number is not in format 555-555-5555", async () => {
      const data = {
        user_name: "John",
        mobile_number: "1234567890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if admin already exists with phone number", async () => {
      const data = {
        user_name: "John",
        mobile_number: "855-000-0000",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is empty", async () => {
      const data = {
        user_name: "John",
        mobile_number: "123-456-7890",
        password: "",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is missing", async () => {
      const data = {
        user_name: "John",
        mobile_number: "123-456-7890",
        role: "admin",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is empty", async () => {
      const data = {
        user_name: "John",
        mobile_number: "123-456-7890",
        password: "test",
        role: "",
      };
      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is missing", async () => {
      const data = {
        user_name: "John",
        mobile_number: "123-456-7890",
        password: "test",
      };
      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 201 if data is valid with newly created admin that has hashed password ", async () => {
      const data = {
        user_name: "John T",
        mobile_number: "123-456-7890",
        password: "test",
        role: "user",
      };

      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      const passwordIsValidHash = await validPassword(
        data.password,
        response.body.data.password
      );

      expect(response.body.data.password).not.toBe("test");
      expect(passwordIsValidHash).toBeTruthy();
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toEqual(
        expect.objectContaining({
          user_name: "John T",
          mobile_number: "123-456-7890",
          role: "admin",
        })
      );

      expect(response.status).toBe(201);
    });
  });

  describe("GET /users/:user_id", () => {
    test("returns 404 for non-existent user_id", async () => {
      const response = await request(app)
        .get("/users/99")
        .set("Accept", "application/json");

      expect(response.body.error).toContain("99");
      expect(response.status).toBe(404);
    });

    test("returns 200 for existing id", async () => {
      const user = await knex("users").where({ user_name: "John" }).first();

      const response = await request(app)
        .get(`/users/${user.user_id}`)
        .set("Accept", "application/json");

      expect(response.body.error).toBeUndefined();
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(user);
    });
  });

  describe("PUT /users/:user_id", () => {
    let csrfResponse;
    let userId;

    beforeEach(async () => {
      csrfResponse = await request(app)
        .get("/csrf")
        .set("Accept", "application/json");
      userId = await knex("users")
        .where({ user_name: "John" })
        .first("user_id");
    });

    test("returns 404 for non-existent user_id", async () => {
      const response = await request(app)
        .put("/users/99")
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data: {} });

      expect(response.body.error).toContain("99");
      expect(response.status).toBe(404);
    });

    test("returns 400 if data is missing", async () => {
      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ datum: {} });

      expect(response.body.error).toBeDefined();
      expect(response.status).toBe(400);
    });

    test("returns 400 if user_name is empty", async () => {
      const data = {
        user_name: "",
        mobile_number: "855-000-0000",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("user_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if user_name is missing", async () => {
      const data = {
        mobile_number: "855-000-0000",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("user_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is empty", async () => {
      const data = {
        user_name: "Jane",
        mobile_number: "",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is missing", async () => {
      const data = {
        user_name: "Jane",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile number is not in format 555-555-5555", async () => {
      const data = {
        user_name: "Jane",
        mobile_number: "1234567890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if a different user already exists with phone number if phone number is different from the current one", async () => {
      const data = {
        user_name: "Jane",
        mobile_number: "800-555-5555",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is empty", async () => {
      const data = {
        user_name: "John",
        mobile_number: "123-456-7890",
        password: "",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is missing", async () => {
      const data = {
        user_name: "Jane",
        mobile_number: "123-456-7890",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is empty", async () => {
      const data = {
        user_name: "Jane",
        mobile_number: "123-456-7890",
        password: "test",
        role: "",
      };
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is missing", async () => {
      const data = {
        user_name: "Jane",
        mobile_number: "123-456-7890",
        password: "test",
      };
      
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 201 if data is valid with newly created user that has hashed password ", async () => {
      const data = {
        user_name: "Jane",
        mobile_number: "123-456-7890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Accept", "application/json")
        .set("x-csrf-token", csrfResponse.body.data || null)
        .set("Cookie", csrfResponse.headers["set-cookie"] || null)
        .send({ data });

      const passwordIsValidHash = await validPassword(
        data.password,
        response.body.data.password
      );

      expect(response.body.data.password).not.toBe("test");
      expect(passwordIsValidHash).toBeTruthy();
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toEqual(
        expect.objectContaining({
          user_name: "Jane",
          mobile_number: "123-456-7890",
          role: "admin",
        })
      );

      expect(response.status).toBe(201);
    });
  });
});
