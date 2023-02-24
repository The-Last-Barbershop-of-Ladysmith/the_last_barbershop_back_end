const request = require("supertest");
const app = require("../src/app");
const knex = require("../src/db/connection");
const {
  generateHashedPassword,
  validPassword,
} = require("../src/utils/password-utils");

describe("01 - Create Read and Update Admins", () => {
    
  /**Admins table will have the following structure
   * admin_id - uuid - primary key
   * admin_name - string - name admin would like to go by
   * mobile_number - string - pattern [^\d{3}-\d{3}-\d{4}$] - admin contact number that will be used as login "username"
   * password - string - login password.  hashed password will be saved in db
   * role - string - current role of admin.  Should be admin or terminated
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

  describe("POST /admins", () => {
    test("returns 400 if data is missing", async () => {
      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ datum: {} });

      expect(response.body.error).toBeDefined();
      expect(response.status).toBe(400);
    });

    test("returns 400 if admin_name is empty", async () => {
      const data = {
        admin_name: "",
        mobile_number: "123-456-7890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("admin_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if admin_name is missing", async () => {
      const data = {
        mobile_number: "123-456-7890",
        password: "test",
        role: "admin",
      };
      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("admin_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is empty", async () => {
      const data = {
        admin_name: "John",
        mobile_number: "",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is missing", async () => {
      const data = {
        admin_name: "John",
        password: "test",
        role: "admin",
      };
      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error), toContain("mobile-number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile number is not in format [^d{3}-d{3}-d{4}$]", async () => {
      const data = {
        admin_name: "John",
        mobile_number: "1234567890",
        password: "test",
        role: "admin",
      };
      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if admin already exists with phone number", async () => {
      const data = {
        admin_name: "John",
        mobile_number: "855-000-0000",
        password: "test",
        role: "admin",
      };
      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is empty", async () => {
      const data = {
        admin_name: "John",
        mobile_number: "123-456-7890",
        password: "",
        role: "admin",
      };

      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is missing", async () => {
      const data = {
        admin_name: "John",
        mobile_number: "123-456-7890",
        role: "admin",
      };

      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is empty", async () => {
      const data = {
        admin_name: "John",
        mobile_number: "123-456-7890",
        password: "test",
        role: "",
      };
      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is missing", async () => {
      const data = {
        admin_name: "John",
        mobile_number: "123-456-7890",
        password: "test",
      };
      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 201 if data is valid with newly created admin that has hashed password ", async () => {
      const data = {
        admin_name: "John T",
        mobile_number: "123-456-7890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .post("/admins")
        .set("Accept", "application/json")
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
          admin_name: "John",
          mobile_number: "123-456-7890",
          role: "admin",
        })
      );

      expect(response.status).toBe(201);
    });
  });

  describe("GET /admins/:admin_id", () => {
    test("returns 404 for non-existent admin_id", async () => {
      const response = await request(app)
        .get("/admins/99")
        .set("Accept", "application/json");

      expect(response.body.error).toContain("99");
      expect(response.status).toBe(404);
    });

    test("returns 200 for existing id", async () => {
      const admin = await knex("admins").where({ admin_name: "John" }).first();

      const response = await request(app)
        .get(`/admins/${admin.admin_id}`)
        .set("Accept", "application/json");

      expect(response.body.error).toBeUndefined();
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(admin);
    });
  });

  describe("PUT /admins/:admin_id", () => {
    test("returns 404 for non-existent admin_id", async () => {
      const response = await request(app)
        .put("/admins/99")
        .set("Accept", "application/json")
        .send({ data: {} });

      expect(response.body.error).toContain("99");
      expect(response.status).toBe(404);
    });

    test("returns 400 if data is missing", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ datum: {} });

      expect(response.body.error).toBeDefined();
      expect(response.status).toBe(400);
    });

    test("returns 400 if admin_name is empty", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "",
        mobile_number: "855-000-0000",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("admin_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if admin_name is missing", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        mobile_number: "855-000-0000",
        password: "test",
        role: "admin",
      };
      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("admin_name");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is empty", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        mobile_number: "",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile_number is missing", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        password: "test",
        role: "admin",
      };
      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if mobile number is not in format [^d{3}-d{3}-d{4}$]", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        mobile_number: "1234567890",
        password: "test",
        role: "admin",
      };
      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if a different admin already exists with phone number if phone number is different from the current one", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        mobile_number: "800-555-5555",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("mobile_number");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is empty", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "John",
        mobile_number: "123-456-7890",
        password: "",
        role: "admin",
      };

      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if password is missing", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        mobile_number: "123-456-7890",
        role: "admin",
      };

      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("password");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is empty", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        mobile_number: "123-456-7890",
        password: "test",
        role: "",
      };
      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 400 if role is missing", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        mobile_number: "123-456-7890",
        password: "test",
      };
      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
        .send({ data });

      expect(response.body.error).toContain("role");
      expect(response.status).toBe(400);
    });

    test("returns 201 if data is valid with newly created admin that has hashed password ", async () => {
      const adminId = await knex("admins")
        .where({ admin_name: "John" })
        .first("admin_id");

      const putURL = `/admins/${adminId}`;

      const data = {
        admin_name: "Jane",
        mobile_number: "123-456-7890",
        password: "test",
        role: "admin",
      };

      const response = await request(app)
        .put(putURL)
        .set("Accept", "application/json")
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
          admin_name: "Jane",
          mobile_number: "123-456-7890",
          role: "admin",
        })
      );

      expect(response.status).toBe(201);
    });
  });
});
