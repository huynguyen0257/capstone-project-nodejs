import { App } from "../app.express";
import { DbContext } from "../repository/dbContext"
import { UserVM } from "../view-model";
import { plainToClass } from "class-transformer";
import request from "supertest";


(async () => {
    const context: DbContext = new DbContext();
    var app: App;
    describe("Test USER Management", () => {
        beforeAll(async (done) => {
            await context.connection();
            app = new App(context.sequelize);
            done()
        });
        let user: any = {
            Username: "user.test.0110@gmail.com",
            FullName: "Nguyen Gia Huy",
            Password: "zaq@123",
            Email: "user.test.0110@gmail.com",
            Phone: "0798051011",
            Gender: true,
            BirthDate: null,
            Code: 'SE05344'
        }

        const userLogin = {
            Username: "xhunter1412@gmail.com",
            Password: "123456",
        };

        let token = "waiting for token ...";

        test("get token", async (done) => {
            const result = await request(app.app).post("/api/Auth/Token").send(userLogin).set('Authorization', token)
            expect(result.status).toEqual(200);
            token = result.body.AccessToken;
            done();
        });

        test("get role for new user", async (done) => {
            var result = await request(app.app).get("/api/Role").set('Authorization', token);
            expect(result.status).toEqual(200);
            expect(result.body.length).toBeGreaterThan(0);
            user.RoleId = result.body[0].Id;
            done()
        })

        test("create new user", async (done) => {
            var result = await request(app.app).post("/api/User").send(user).set('Authorization', token);
            expect(result.status).toEqual(201);
            user.Id = result.body.Id;
            user.Avatar = null;
            user.IsActive = true;
            done()
        })

        test("get all users", async (done) => {
            var result = await request(app.app).get("/api/User").set('Authorization', token);
            expect(result.status).toEqual(200);
            expect(result.body.filter((e: any) => e.Username == user.Username).length).toEqual(1)
            done()
        })

        test("Get user by Id", async (done) => {
            var result = await request(app.app).get("/api/User/" + user.Id).set('Authorization', token);
            expect(result.status).toEqual(200);
            expect(result.body.Email).toEqual(user.Email);
            done()
        })

        test("update name of user", async (done) => {
            user.FullName = "New Name";
            var result = await request(app.app).put("/api/User").send(user).set('Authorization', token);
            expect(result.status).toEqual(200);
            expect(result.body.FullName).toEqual(user.FullName)
            done()
        })

        test("Disable user via userId", async (done) => {
            var result = await request(app.app).put("/api/User/" + user.Id + "/SwitchActive").set('Authorization', token);
            expect(result.status).toEqual(200);
            done()
        })

        test("Check disabled user status (1 is disabled) ", async (done) => {
            var result = await request(app.app).get("/api/User/" + user.Id).set('Authorization', token)
            // console.log("result.body: " + result.body.Disable);
            expect(result.body.IsActive).toEqual(false)
            done()
        })

        test("Enable user via userId", async (done) => {
            var result = await request(app.app).put(`/api/User/${user.Id}/SwitchActive`).set('Authorization', token)
            expect(result.status).toEqual(200);
            done()
        })

        test("Check enabled user status (1 is disabled) ", async (done) => {
            var result = await request(app.app).get("/api/User/" + user.Id).set('Authorization', token)
            expect(result.body.IsActive).toEqual(true)
            done()
        })

        test("Delete the unused user ( this api don't not use for user) ", async (done) => {
            var result = await request(app.app).delete("/api/User/" + user.Id).set('Authorization', token)
            expect(result.status).toEqual(200)
            done()
        })

        test("get role student for new user", async (done) => {
            user = { 
                Username: "huynguyen02257@gmail.com",
                FullName: "Nguyen Gia Huy",
                Password: "zaq@123",
                Email: "huynguyen02257@gmail.com",
                Phone: "0798051011",
                Gender: true,
                BirthDate: null,
                Code: 'SE558856'
            }

            var result = await request(app.app).get("/api/Role").set('Authorization', token);
            expect(result.status).toEqual(200);
            expect(result.body.length).toBeGreaterThan(0);
            expect(result.body.filter((e: any) => e.Name == 'Student').length).toBeGreaterThan(0);
            user.RoleId = result.body.filter((e: any) => e.Name == 'Student')[0].Id;
            done()
        })

        test("get university", async (done) => {
            var result = await request(app.app).get("/api/University").set('Authorization', token);
            expect(result.status).toEqual(200);
            expect(result.body.length).toBeGreaterThan(0);
            user.UniversityId = result.body[0].Id;
            done()
        })
    

        test("create new user", async (done) => {
            var result = await request(app.app).post("/api/User").send(user).set('Authorization', token);
            expect(result.status).toEqual(201);
            user.Id = result.body.Id;
            user.Avatar = null;
            user.IsActive = true;
            done()
        })

        test("Delete the unused user ( this api don't not use for user) ", async (done) => {
            var result = await request(app.app).delete("/api/User/" + user.Id).set('Authorization', token)
            expect(result.status).toEqual(200)
            done()
        })

        afterAll(async (done) => {
            await context.disconnect();
            done()
        });
    });
})();