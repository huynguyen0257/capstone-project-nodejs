import "module-alias/register";
import { App } from "./../app.express";
import { DbContext } from "./../repository/dbContext";
import request from "supertest";
import { plainToClass } from "class-transformer";
import { SecurityManVM } from "../view-model";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Security Man Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done()
    });

    const userLogin = {
      Username: 'xhunter1412@gmail.com',
      Password: '123456'
    }
    let token ='waiting for token ...'
    test("get token", async (done) => {
      const result = await request(app.app).post("/api/Auth/Token").send(userLogin);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      done();
    })
    const securityMen: any = {
        Username: "guard.test@gmail.com",
        FullName: "Dao Thi Hoai Thuong",
        Password: "zaq@123",
        Email: "guard.test@gmail.com",
        Phone: "033122334",
        Gender: true,
        BirthDate: null,
        Code: 'SE0539757'
    }

    
    test("get role for new user", async (done) => {
        var result = await request(app.app).get("/api/Role").set('Authorization', token);
        expect(result.status).toEqual(200);
        expect(result.body.length).toBeGreaterThan(0);
        securityMen.RoleId = result.body.filter((e:any) => e.Name !== 'Student')[0].Id;
        done()
    })

    test("create new securityMen", async (done) => {
        var result = await request(app.app).post("/api/User").send(securityMen).set('Authorization', token);
        console.log(result.body)
        expect(result.status).toEqual(201);
        securityMen.Id = result.body.Id
        done()
    })


    test("Get all Security Man", async (done) => {
        var result = await request(app.app).get("/api/SecurityMan").set('Authorization', token)
        expect(result.status).toEqual(200)
        expect(result.body.filter((e:any) =>e.Username === securityMen.Username && e.Code === securityMen.Code).length).toEqual(1)
        done()
    })

    test("Delete the unused user ( this api don't not use for user) ", async (done) => {
        var result = await request(app.app).delete("/api/User/" + securityMen.Id).set('Authorization', token)
        expect(result.status).toEqual(200)
        done()
    })
    afterAll(async (done) => {
      await context.disconnect();
      done()
    });
  });
})();
