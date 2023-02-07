const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");
const { generatePassword } = require("../src/utils/password-utils");

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
                .set("Accect", "application/json")
                .send({ datum: {} })

            expect(response.body.error).toBeDefined();
            expect(response.status).toBe(400);
        })

        test("returns 400 if admin_name is empty", async () => {
            const data = {
                admin_name: "",
                mobile_number: "123-456-7890",
                password: "test",
                role: "admin",
            }

            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('admin_name');
            expect(response.status).toBe(400);
        })

        test("returns 400 if admin_name is missing", async () => {
            const data = {
                mobile_number: "123-456-7890",
                password: "test",
                role: "admin",
            }
            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('admin_name');
            expect(response.status).toBe(400);
        })

        test("returns 400 if mobile_number is empty", async () => {
            const data = {
                admin_name: 'John',
                mobile_number: "",
                password: "test",
                role: "admin",
            }

            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('mobile_number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if mobile_number is missing", async () => {
            const data = {
                admin_name: "John",
                password: "test",
                role: "admin",
            }
            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error), toContain('mobile-number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if mobile number is not in format [^\d{3}-\d{3}-\d{4}$]", async () => {
            const data = {
                admin_name: "John",
                mobile_number: "1234567890",
                password: "test",
                role: "admin",
            }
            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('mobile_number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if admin already exists with phone number", async () => {
            const data = {
                admin_name: "John",
                mobile_number: "855-555-5555",
                password: "test",
                role: "admin",
            }
            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('mobile_number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if password is empty", async () => {

            const data = {
                admin_name: "John",
                mobile_number: "123-456-7890",
                password: "",
                role: "admin",
            }

            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('password');
            expect(response.status).toBe(400);
        })

        test("returns 400 if password is missing", async () => {
            const data = {
                admin_name: "John",
                mobile_number: "123-456-7890",
                role: "admin",
            }

            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('password')
            expect(response.status).toBe(400);
        })

        test("returns 400 if role is empty", async () => {
        
            const data = {
                admin_name: "John",
                mobile_number: "123-456-7890",
                password: "test",
                role: ""
            }
            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('role');
            expect(response.status).toBe(400);
        })

        test("returns 400 if role is missing", async () => {
            const data = {
                admin_name: "John",
                mobile_number: "123-456-7890",
                password: "test",
            }
            const response = await request(app)
                .post("/admins")
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('role');
            expect(response.status).toBe(400);
        })

        test("returns 201 if data is valid with newly created admin that has hashed password ", async () => {

            const data = {
                admin_name: "John",
                mobile_number: "123-456-7890",
                password: "test",
                role: "admin",
            };

            const response = await request(app)
                .post("/admins")
                .set("Accept", "application/json")
                .send({ data });

            const hashedPassword = await generatePassword(data.password)

            expect(response.body.error).toBeUndefined();
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    admin_name: "John",
                    mobile_number: "123-456-7890",
                    password: hashedPassword,
                    role: "admin",
                })
            );

            expect(response.status).toBe(201);
        });

    })

    describe("GET /admins/:admin_id", () => {
        test("returns 404 for non-existent admin_id", async () => {
            const response = await request(app)
                .get("/admins/99")
                .set("Accept", "application/json");

            expect(response.body.error).toContain("99");
            expect(response.status).toBe(404);
        });

        test("returns 200 for existing id", async () => {
            const response = await request(app)
            const admin = await knex('admins').select('*').first()
                .get(`/admins/${admin.admin_id}`)
                .set("Accept", "application/json")

            expect(response.body.error).toBeUndefined()
            expect(response.status).toBe(200)
            expect(response.body.data).toEqual(
                expect.objectContaining({ admin })
            )
        })



    })

    describe("PUT /admins/:admin_id", () => {
        const admin = knex('admins').select('*').first()
        const { admin_id } = admin
        const putURL = `/admins/${admin_id}`

        test("returns 404 for non-existent admin_id", async () => {
            const response = await request(app)
                .put("/admins/99")
                .set("Accept", "application/json")
                .send({ data: {} })

            expect(response.body.error).toContain("99");
            expect(response.status).toBe(404);
        });
        test("returns 400 if data is missing", async () => {
            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ datum: {} })

            expect(response.body.error).toBeDefined();
            expect(response.status).toBe(400);
        })

        test("returns 400 if admin_name is empty", async () => {
            const data = {
                admin_name: "",
                mobile_number: '855-000-0000',
                password: 'test',
                role: "admin",
            }

            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('admin_name');
            expect(response.status).toBe(400);
        })

        test("returns 400 if admin_name is missing", async () => {
            const data = {
                mobile_number: '855-000-0000',
                password: 'test',
                role: "admin",
            }
            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('admin_name');
            expect(response.status).toBe(400);
        })

        test("returns 400 if mobile_number is empty", async () => {
            const data = {
                admin_name: 'Jane',
                mobile_number: '',
                password: 'test',
                role: "admin",
            }

            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('mobile_number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if mobile_number is missing", async () => {
            const data = {
                admin_name: 'Jane',
                password: 'test',
                role: "admin",
            }
            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('mobile_number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if mobile number is not in format [^\d{3}-\d{3}-\d{4}$]", async () => {
            const data = {
                admin_name: "Jane",
                mobile_number: "1234567890",
                password: "test",
                role: "admin",
            }
            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('mobile_number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if a different admin already exists with phone number", async () => {
            const newAdmin = {
                admin_name: "Maria",
                mobile_number: "800-555-5555",
                password: generatePassword('apples'),
                role: "admin",
            }

            await knex('admins').insert(newAdmin, '*')

            const data = {
                admin_name: "Jane",
                mobile_number: "800-555-5555",
                password: "test",
                role: "admin",
            }
            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('mobile_number');
            expect(response.status).toBe(400);
        })

        test("returns 400 if password is empty", async () => {

            const data = {
                admin_name: "John",
                mobile_number: "123-456-7890",
                password: "",
                role: "admin",
            }

            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('password');
            expect(response.status).toBe(400);
        })

        test("returns 400 if password is missing", async () => {
            const data = {
                admin_name: "Jane",
                mobile_number: "123-456-7890",
                role: "admin",
            }

            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('password');
            expect(response.status).toBe(400);
        })

        test("returns 400 if role is empty", async () => {
            const data = {
                admin_name: "Jane",
                mobile_number: "123-456-7890",
                password: "test",
                role: ""
            }
            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('role');
            expect(response.status).toBe(400);
        })

        test("returns 400 if role is missing", async () => {
            const data = {
                admin_name: "Jane",
                mobile_number: "123-456-7890",
                password: "test",
            }
            const response = await request(app)
                .put(putURL)
                .set("Accect", "application/json")
                .send({ data })

            expect(response.body.error).toContain('role');
            expect(response.status).toBe(400);
        })

        test("returns 201 if data is valid with newly created admin that has hashed password ", async () => {

            const data = {
                admin_name: "Jane",
                mobile_number: "123-456-7890",
                password: "test",
                role: "admin",
            };

            const response = await request(app)
                .put()
                .set("Accept", "application/json")
                .send({ data });

            const hashedPassword = await generatePassword(data.password)

            expect(response.body.error).toBeUndefined();
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    admin_name: "John",
                    mobile_number: "123-456-7890",
                    password: hashedPassword,
                    role: "admin",
                })
            );

            expect(response.status).toBe(201);
        });

    })


})