import "module-alias/register";
import { App } from "./../app.express";
import { DbContext } from "./../repository/dbContext";
import request from "supertest";
import { runMain } from "module";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Prohibited Item Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done();
    });

    const user = {
      Username: "xhunter1412@gmail.com",
      Password: "123456",
    };
    let token = "waiting for token ...";
    test("get token", async (done) => {
      const result = await request(app.app).post("/api/Auth/Token").send(user);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      done();
    });

    const item: any = {
      Name: "baton" + Math.floor(Math.random()*100) ,
    };
    test("POST method", async (done) => {
      const result = await request(app.app)
        .post("/api/ProhibitedItem")
        .send(item);
      expect(result.status).toEqual(201);
      expect(result.body.IsDelete).toEqual(false);
      item.Id = result.body.Id;
      item.IsDelete = false;
      done();
    });
    test("Get All method", async (done) => {
      const result = await request(app.app).get("/api/ProhibitedItem");
      expect(result.body).toContainEqual(item);
      done();
    });

    test("Update method ( delete and update name ) ", async (done) => {
      item.Name = item.Name + "Updated";
      const result = await request(app.app)
        .put("/api/ProhibitedItem")
        .send(item);
      expect(result.body.Name).toEqual(item.Name);
      done();
    });

    afterAll(async (done) => {
      await context.disconnect();
      done();
    });
  });
})();
