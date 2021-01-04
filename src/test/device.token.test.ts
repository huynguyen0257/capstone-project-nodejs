import { App } from "../app.express";
import { DbContext } from "../repository/dbContext";
import request from "supertest";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Device Token Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done();
    });

    let token = "waiting for token ...";
    const user: any = {
      Username: "dongtv@gmail.com",
      FullName: "Dao Thi Hoai Thuong",
      Password: "zaq@123",
      Email: "dongtv@gmail.com",
      Phone: "0334885952",
      Gender: false,
      BirthDate: null,
      Code: 'SE05344'
    };

    //User must have id = 1
    const deviceToken: any = {
      Token: "asdfsdf",
      DeviceType: "browser",
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
        .set("Authorization", token);
      expect(result.status).toEqual(201);
      user.Id = result.body.Id;
      deviceToken.UserId = user.Id;
      done();
    });

    test("get token", async (done) => {
      const result = await request(app.app)
        .post("/api/Auth/Token")
        .send(user);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      // await request(app.app).post("/api/Auth/Token").send(user);
      done();
    });

    test("post token", async (done) => {
      var result = await request(app.app)
        .post("/api/DeviceToken")
        .send(deviceToken)
        .set("Authorization", token);
      expect(result.status).toEqual(201);
      deviceToken.Id = result.body.Id;
      done();
    });

    test("Get all token", async (done) => {
      var result = await request(app.app)
        .get("/api/DeviceToken")
        .set("Authorization", token);
      expect(result.body).toContainEqual(deviceToken);
      done();
    });

    // test("Get device token by user Id", async (done) => {
    //   var result = await request(app.app).get("/api/User/" + deviceToken.UserId+ "/DeviceToken").set('Authorization',token);;
    //   expect(result.body).toContainEqual(deviceToken);
    //   done()
    // });

    test("Delete token device ", async (done) => {
      var result = await request(app.app)
        .delete("/api/DeviceToken/" + deviceToken.Id)
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      done();
    });

    test("Get all method to check delete token", async (done) => {
      var result = await request(app.app)
        .get("/api/DeviceToken")
        .set("Authorization", token);
      expect(result.body).not.toContainEqual(deviceToken);
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
