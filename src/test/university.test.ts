import "module-alias/register";
import { App } from "./../app.express";
import { DbContext } from "./../repository/dbContext";
import request from "supertest";
import { runMain } from "module";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the University Management",() => {
    beforeAll( async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done()
    });
    const university: any = {
      Name: 'FPT University',
    }
    test("POST method", async (done) => {
      const result = await request(app.app).post("/api/University").send(university);
      expect(result.status).toEqual(201);
      university.Id = result.body.Id;
      done()
    });
    test("Get All method", async (done) => {
      const result = await request(app.app).get("/api/University");
      expect(result.body).toContainEqual({Id: university.Id, Name: university.Name});
      done()

    });
   
    university.Name = "Updated"
    test("Update method", async (done) => {
      const result = await request(app.app).put("/api/University").send(university);
      expect(result.body.Name).toEqual("Updated");
      done()

    });

    university.IsDelete = true
    
    test("Delete via Update method", async (done) => {
        const result = await request(app.app).put("/api/University").send(university);
        expect(result.status).toEqual(200);
        done()
      });

    test("Get All method 2", async (done) => {
      const result = await request(app.app).get("/api/University");
      expect(result.body).not.toContainEqual(university);
      done()
    });
    afterAll(async (done) => {
      await context.disconnect();
      done()
    });
  });
})();
