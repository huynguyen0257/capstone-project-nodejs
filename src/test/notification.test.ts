import "module-alias/register";
import { App } from "./../app.express";
import { DbContext } from "./../repository/dbContext";
import request from "supertest";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Notification Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done()
    });

    const user = {
      Username: 'xhunter1412@gmail.com',
      Password: '123456'
    }
    let token ='waiting for token ...'
    test("get token", async (done) => {
      const result = await request(app.app).post("/api/Auth/Token").send(user);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      done();
    })
    test("Get By User ID method", async (done) => {
      const result = await request(app.app).get("/api/notification").set('Authorization',token);
      expect(result.status).toEqual(200);
      done()
    });

    afterAll(async (done) => {
      await context.disconnect();
      done()
    });
  });
})();
