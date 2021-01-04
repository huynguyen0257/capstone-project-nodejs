import "module-alias/register";
import { App } from "./../app.express";
import { DbContext } from "./../repository/dbContext";
import request from "supertest";
import { plainToClass } from "class-transformer";
import { StudentVM } from "../view-model";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Student Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done();
    });

    const userLogin = {
      Username: "xhunter1412@gmail.com",
      Password: "123456",
    };
    let user: any = {};
    let token = "waiting for token ...";
    test("get token", async (done) => {
      const result = await request(app.app)
        .post("/api/Auth/Token")
        .send(userLogin);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      done();
    });
    test("get role student for new user", async (done) => {
      user = {
        Username: "huynguyen02257@gmail.com",
        FullName: "Nguyen Gia Huy",
        Password: "zaq@123",
        Email: "huynguyen02257@gmail.com",
        Phone: "0798051011",
        Gender: true,
        BirthDate: null,
        Code: "SE558856",
      };

      var result = await request(app.app)
        .get("/api/Role")
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      expect(result.body.length).toBeGreaterThan(0);
      expect(
        result.body.filter((e: any) => e.Name == "Student").length
      ).toBeGreaterThan(0);
      user.RoleId = result.body.filter((e: any) => e.Name == "Student")[0].Id;
      done();
    });

    test("get university", async (done) => {
      var result = await request(app.app)
        .get("/api/University")
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      expect(result.body.length).toBeGreaterThan(0);
      user.UniversityId = result.body[0].Id;
      done();
    });

    test("create new user", async (done) => {
      var result = await request(app.app)
        .post("/api/User")
        .send(user)
        .set("Authorization", token);
      expect(result.status).toEqual(201);
      user.Id = result.body.Id;
      done();
    });

    test("Get all ", async (done) => {
      var expectedResult : any = plainToClass(StudentVM, user, {
        excludeExtraneousValues: true,
      });
      var result = await request(app.app)
        .get("/api/student/")
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      expect(result.body.filter((e: any) => e.Username === user.Username).length).toEqual(1);
      done();
    });

    test("Delete the unused user ( this api don't not use for user) ", async (done) => {
      var result = await request(app.app)
        .delete("/api/User/" + user.Id)
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      done();
    });
    afterAll(async (done) => {
      await context.disconnect();
      done();
    });
  });
})();
