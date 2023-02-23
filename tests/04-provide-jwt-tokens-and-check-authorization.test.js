const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

/** TODO complete test to include all routes that include POST, PUT, and DELETE ENDPOINTS */

describe("04 - Provide JWT and CSRF Tokens and check authorization", () => {

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

    /** Test Double CSRF strategy. 
     *  
     * A csrf token should be generated with a get request
     * A hashed version of the csrf will be sent in the cookies (tests will look for cookie name "csrfToken")
     * and the original token will be sent in the response
     * 
     * VALIDATION - The hashed csrf from the cookie will be matched against the hash of the original token
     * validation will only occur routes that are not GET requests
     * 
     * USAGE - on every PUT, POST, DELETE request sent user must retrieve a new CSRF and pass the validation
     * 
     *  **/

    describe("GET /csrf", () => {

        test("returns the csrf token", async () => {
            const response = await request(app)
                .get('/csrf')
                .set("Accept", "application/json")

            expect(response.status).toBe(200)
            expect(response.body.data).toBeTruthy()
        })
        test("sends a cookie name csrfToken within the response", async () => {
            const response = await request(app)
                .get('/csrf')

            /** Read response header of Set-Cookie to see if it includes a given text property */
            const cookieHasProperty = (property) => {
                return response.headers['set-cookie'][0].includes(property)
            }

            expect(cookieHasProperty('csrfToken')).toBeTruthy()
            expect(cookieHasProperty('Max-Age=86400')).toBeTruthy()
            expect(cookieHasProperty('HttpOnly')).toBeTruthy()
            expect(cookieHasProperty('Path=/')).toBeTruthy()
            expect(cookieHasProperty('Secure')).toBeTruthy()
            expect(response.status).toBe(200)
        })
    })

    describe("POST /appointments", () => {
        test("returns 403 if hashed csrf token in cookies is not sent with request and csrf token not sent in request headers", async () => {

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2025-01-15",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .post('/appointments')
                .set("Accept", "application/json")
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        test("returns 403 if csrf token is not in request headers", async () => {

            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2025-01-15",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .post('/appointments')
                .set("Accept", "application/json")
                .set('Cookie', [...csrfResponse.headers['set-cookie']])
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        test("returns 403 if hashed csrf token in cookies is not sent with request", async () => {
            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2025-01-15",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .post('/appointments')
                .set("Accept", "application/json")
                .set('x-csrf-token', csrfResponse.body.data)
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        test("returns 201 if POST request is submitted with proper csrf credentials and valid body", async () => {
            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                appointment_date: "2025-01-15",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .post('/appointments')
                .set("Accept", "application/json")
                .set('x-csrf-token', csrfResponse.body.data)
                .set('Cookie', csrfResponse.headers['set-cookie'])
                .send(data)

            expect(response.status).toBe(201)
            expect(response.body.error).toBeUndefined();
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    first_name: "first",
                    last_name: "last",
                    mobile_number: "800-555-1212",
                    appointment_date: expect.stringContaining("2025-01-15"),
                    appointment_time: expect.stringContaining("17:30"),
                    people: 2,
                })
            );

        })
    })

    describe("PUT /appointments", () => {

        test("returns 403 if hashed csrf token in cookies is not sent with request and csrf token not sent in request headers", async () => {

            const appointment = await knex('appointments')
                .where({ first_name: "CsrfToken" })
                .first()

            const putUrl = `/appointments/${appointment.appointment_id}`

            const data = {
                first_name: "CsrfToken",
                last_name: "Accepted",
                mobile_number: "999-999-9999",
                appointment_date: "2025-01-18",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .put(putUrl)
                .set("Accept", "application/json")
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        test("returns 403 if csrf token is not in request headers", async () => {
            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const appointment = await knex('appointments')
                .where({ first_name: "CsrfToken" })
                .first()

            const putUrl = `/appointments/${appointment.appointment_id}`

            const data = {
                first_name: "CsrfToken",
                last_name: "Accepted",
                mobile_number: "999-999-9999",
                appointment_date: "2025-01-18",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .put(putUrl)
                .set("Accept", "application/json")
                .set('Cookie', [...csrfResponse.headers['set-cookie']])
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        test("returns 403 if hashed csrf token in cookies is not sent with request", async () => {

            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const appointment = await knex('appointments')
                .where({ first_name: "CsrfToken" })
                .first()

            const putUrl = `/appointments/${appointment.appointment_id}`

            const data = {
                first_name: "CsrfToken",
                last_name: "Accepted",
                mobile_number: "999-999-9999",
                appointment_date: "2025-01-18",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .put(putUrl)
                .set("Accept", "application/json")
                .set('x-csrf-token', csrfResponse.body.data)
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")

        })

        test("returns 201 if PUT request is submitted with proper csrf credentials and valid body", async () => {

            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const appointment = await knex('appointments')
                .where({ first_name: "CsrfToken" })
                .first()

            const putUrl = `/appointments/${appointment.appointment_id}`

            const data = {
                first_name: "CsrfToken",
                last_name: "Accepted",
                mobile_number: "999-999-9999",
                appointment_date: "2025-01-18",
                appointment_time: "13:30",
                people: 1,
            }

            const response = await (app)
                .put(putUrl)
                .set("Accept", "application/json")
                .set('x-csrf-token', csrfResponse.body.data)
                .set('Cookie', csrfResponse.headers['set-cookie'])
                .send(data)

            expect(response.status).toBe(201)
            expect(response.body.error).toBeUndefined();
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    first_name: "CsrfToken",
                    last_name: "Accepted",
                    mobile_number: "999-999-9999",
                    appointment_date: expect.stringContaining("2025-01-18"),
                    appointment_time: expect.stringContaining("13:30"),
                    people: 1,
                })
            );
        })
    })

    describe("POST /users/login", () => {

        test("returns 403 if hashed csrf token in cookies is not sent with request and csrf token not sent in request headers", async () => {

            const admin = await knex('admins')
                .where({ admin_name: "John" })
                .first()

            const data = { mobile_number: admin.mobile_number, password: process.env.SEED_PASSWORD }

            const response = await (app)
                .post('/users/login')
                .set("Accept", "application/json")
                .send({ data })

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        test("returns 403 if csrf token is not in request headers", async () => {

            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const admin = await knex('admins')
                .where({ admin_name: "John" })
                .first()

            const data = { mobile_number: admin.mobile_number, password: process.env.SEED_PASSWORD }

            const response = await (app)
                .post('/users/login')
                .set("Accept", "application/json")
                .set('Cookie', [...csrfResponse.headers['set-cookie']])
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        test("returns 403 if hashed csrf token in cookies is not sent with request", async () => {

            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const admin = await knex('admins')
                .where({ admin_name: "John" })
                .first()

            const data = { mobile_number: admin.mobile_number, password: process.env.SEED_PASSWORD }

            const response = await (app)
                .post('/users/login')
                .set("Accept", "application/json")
                .set('x-csrf-token', csrfResponse.body.data)
                .send(data)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("csrf")
        })

        /** JWT strategy will be to send the user a JWT token in the cookies to be used for authentification of admins. 
         * 
         * JWT will be sent as an HTTPOnly cookie 
         * 
         * A mock authentification cookie will be sent to the user with their admin_id to verify that they are authenticated on the front-end
         * 
         * Both cookies will expire within 24 hours and should be provided on routes that allow the performance of admin duties and viewing admin only routes
         * 
         * (tests for admin routes and duties will be specified on test 5,6,7,and 9)
         */
        test('return 200 for VALID POST request with valid CSRF token and sends user a JSON Web Token and userId in the cookies', async () => {

            const csrfResponse = await request(app)
                .get("/csrf")
                .set("Accept", "application/json")

            const admin = await knex('admins')
                .where({ admin_name: "John" })
                .first()

            const data = { mobile_number: admin.mobile_number, password: process.env.SEED_PASSWORD }

            const response = await (app)
                .post('/appointments')
                .set("Accept", "application/json")
                .set('x-csrf-token', csrfResponse.body.data)
                .set('Cookie', csrfResponse.headers['set-cookie'])
                .send(data)

            expect(response.body.error).toBeUndefined();
            expect(response.body.data).toEqual(admin);
            
            /** Read response header of Set-Cookie to see if it includes a given text property */
            const cookieHasProperty = (property) => {
                return response.headers['set-cookie'][0].includes(property)
            }

            expect(cookieHasProperty('JWT_Token')).toBeTruthy()
            expect(cookieHasProperty('Max-Age=86400')).toBeTruthy()
            expect(cookieHasProperty('HttpOnly')).toBeTruthy()
            expect(cookieHasProperty('Path=/')).toBeTruthy()
            expect(cookieHasProperty('Secure')).toBeTruthy()

            expect(cookieHasProperty('admin_id')).toBeTruthy()
            expect(response.status).toBe(200)
        })
    })
})