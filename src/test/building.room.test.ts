import { App } from "../app.express";
import { DbContext } from "../repository/dbContext";
import request from "supertest";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Building - Room Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done();
    });
    const user = {
      Username: "xhunter1412@gmail.com",
      Password: "123456",
    };

    const building: any = {
        Code: 'B-TEST-01',
        Location: 'The third building on the left',
        NumberOfFloor: 1,
        NumberOfRoom: 1,
        NumberOfStudent: 4,
    }

    const room: any = {
        Code: 'B-TEST-01-001',
    }
    let token = "waiting for token ...";
    test("get token", async (done) => {
      const result = await request(app.app).post("/api/Auth/Token").send(user);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      // await request(app.app).post("/api/Auth/Token").send(user);
      done();
    });

    test("Get all Security Man", async (done) => {
        var result = await request(app.app).get("/api/SecurityMan").set('Authorization', token)
        expect(result.status).toEqual(200)
        expect(result.body.length).toBeGreaterThan(0)
        building.ManagerId = result.body[0].Id
        done()
    })

    test("POST create new building ", async (done) => {
        var result = await request(app.app)
          .post("/api/building").send(building)
          .set("Authorization", token);
        expect(result.status).toContainEqual(201);
        building.Id = result.body.Id
        room.BuildingId = building.Id
        done();
      });

    test("GET building list ", async (done) => {
        var result = await request(app.app)
          .get("/api/building")
          .set("Authorization", token);
        expect(result.status).toContainEqual(200);
        expect(result.body.filter((e:any) => e.Code == building.Code)).toEqual(1);
        done();
      });

    test("POST new room ", async (done) => {
      var result = await request(app.app)
        .post("/api/Room")
        .send(room)
        .set("Authorization", token);
      expect(result.status).toEqual(201);
      room.Id = result.body.Id;
      done();
    });

    test("Get room list", async (done) => {
      var result = await request(app.app)
        .get("/api/Room")
        .set("Authorization", token);
      expect(result.body.filter((c:any) => c.Code == room.Code)).toEqual(1);
      done();
    });

    test("Get room list from building Id ", async (done) => {
      var result = await request(app.app)
        .get(`/api/building/${building.Id}/Room`)
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      expect(result.body.filter((e:any) => e.Code == room.Code)).toEqual(1);

      done();
    });

    test("DELETE unused building ", async (done) => {
        var result = await request(app.app)
          .delete(`/api/building/${building.Id}`)
          .set("Authorization", token);
        expect(result.status).toEqual(200);
        done();
      });
      test("GET building list after deleted ", async (done) => {
        var result = await request(app.app)
          .get("/api/building")
          .set("Authorization", token);
        expect(result.status).toContainEqual(200);
        expect(result.body.filter((e:any) => e.Code == building.Code)).toEqual(0);
        done();
      });
    afterAll(async (done) => {
      await context.disconnect();
      done();
    });
  });
})();
