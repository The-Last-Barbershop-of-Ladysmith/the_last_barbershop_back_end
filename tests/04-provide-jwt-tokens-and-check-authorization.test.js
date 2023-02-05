const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

/** TODO complete test to include all routes that include POST, PUT, and DELETE ENDPOINTS */

describe("04 - Provide JWT and CSRF Tokens and check authorization", async () => {

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

    const csrfResponse = await request(app)
    .get("/csrf")
    .set("Accept", "application/json")

    const csrfCookie = csrfResponse.cookies('csrfToken')

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
            const cookieHasProperty = (property) =>{
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
                appointment_date: expect.stringContaining("2025-01-01"),
                appointment_time: expect.stringContaining("17:30"),
                people: 2,
              })
            );

        })
    })


})