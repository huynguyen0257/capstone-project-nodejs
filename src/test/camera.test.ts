import { App } from "../app.express";
import { DbContext } from "../repository/dbContext";
import request from "supertest";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Camera Management", () => {
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
    const camera: any = {
        Code: 'C.Test.01',
        Username: 'admin',
        Password: '123Password',
        RtspLink: '192.168.31.13',
        SocketId: 'Dev',
        BuildingId: 1,
        Type: 0,
        
    }
    test("get token", async (done) => {
      const result = await request(app.app).post("/api/Auth/Token").send(user);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      // await request(app.app).post("/api/Auth/Token").send(user);
      done();
    });

    test("GET building list ", async (done) => {
        var result = await request(app.app)
          .get("/api/building")
          .set("Authorization", token);
        expect(result.status).toEqual(200);
        expect(result.body.length).toBeGreaterThanOrEqual(1);
        camera.BuildingId = result.body[0].Id
        done();
      });

    test("POST create new camera", async (done) => {
      var result = await request(app.app)
        .post("/api/Camera")
        .send(camera)
        .set("Authorization", token);
      expect(result.status).toEqual(201);
      expect(result.body.Status).toEqual(0);
      camera.Id = result.body.Id;
      done();
    });

    test("Get camera list", async (done) => {
      var result = await request(app.app)
        .get("/api/Camera")
        .set("Authorization", token);
      expect(result.body.filter((c:any) => c.Id == camera.Id).length).toEqual(1);
      done();
    });
    
    test("Update camera", async (done) => {
      camera.Username = "admin123";
      var result = await request(app.app)
        .put("/api/Camera")
        .send(camera)
        .set("Authorization", token);
        expect(result.status).toEqual(200);
        expect(result.body.Username).toEqual("admin123");
      done();
    });

      
    test("Delete camera", async (done) => {
      var result = await request(app.app)
        .delete("/api/camera/" + camera.Id)
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      done();
    });

    test("Get camera list  to check delete camera", async (done) => {
      var result = await request(app.app)
        .get("/api/camera")
        .set("Authorization", token);
      expect(result.body.filter((c:any) => c.Id == camera.Id)).not.toEqual(0);
      done();
    });
    
    afterAll(async (done) => {
      await context.disconnect();
      done();
    });
  });
})();
