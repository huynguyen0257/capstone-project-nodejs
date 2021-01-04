import { App } from "../app.express";
import { DbContext } from "../repository/dbContext";
import { UserVM } from "../view-model";
import { plainToClass } from "class-transformer";
import request from "supertest";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("[AUTH] Test auth Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done();
    });
    const user: any = {
      Username: "auth@gmail.com",
      FullName: "Nguyen Gia Huy",
      Password: "zaq@123",
      Email: "auth@gmail.com",
      Phone: "0798051011",
      Gender: true,
      BirthDate: null,
      Code: 'SE05344'
    };
    test("get role for new user", async (done) => {
      var result = await request(app.app)
        .get("/api/Role")
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      expect(result.body.length).toBeGreaterThan(0);
      user.RoleId = result.body[0].Id;
      done();
    });

    test("create new user", async (done) => {
      var result = await request(app.app)
        .post("/api/User")
        .send(user)
        .set("Authorization", token)
        .set("Authorization", token);
      expect(result.status).toEqual(201);
      user.Id = result.body.Id;
      user.Avatar = null;
      user.IsActive = true;
      done();
    });

    let token = "waiting for token ...";

    test("get token", async (done) => {
      const result = await request(app.app)
        .post("/api/Auth/Token")
        .send(user)
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      done();
    });

    test("Disable user via userId", async (done) => {
      var result = await request(app.app)
        .put("/api/User/" + user.Id + "/SwitchActive")
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      done();
    });

    test("Disable user via userId from disabled user", async (done) => {
      var result = await request(app.app)
        .put("/api/User/" + user.Id + "/SwitchActive")
        .set("Authorization", token);
      expect(result.status).toEqual(401);
      done();
    });
    test("get token of disable user", async (done) => {
      const result = await request(app.app)
        .post("/api/Auth/Token")
        .send(user)
        .set("Authorization", token);
      expect(result.status).toEqual(400);
      done();
    });

    test("Delete the unused user ( this api don't not use for user) ", async (done) => {
      var result = await request(app.app)
        .delete("/api/User/" + user.Id)
      expect(result.status).toEqual(200);
      done();
    });

    afterAll(async (done) => {
      await context.disconnect();
      done();
    });
  });
})();
