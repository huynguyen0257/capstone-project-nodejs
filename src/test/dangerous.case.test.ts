import "module-alias/register";
import { App } from "./../app.express";
import { DbContext } from "./../repository/dbContext";
import request from "supertest";
import { environment } from "../environment";
import Moment from "Moment";

(async () => {
  const context: DbContext = new DbContext();
  var app: App;
  describe("Test the Dangerous case Management", () => {
    beforeAll(async (done) => {
      await context.connection();
      app = new App(context.sequelize);
      done();
    });
    const dangerous_case: any = {
      // Code: "TEST-1",
      // Code: "TEST-2",
      Code: `TEST-${(Date.now()% 10000)}`,
      Location: "FPT University",
      Images: [
        {
          Image: environment.images.sample_detection,
        },
        {
          Image: environment.images.sample_image,
        },
      ],
      ProhibitedItemNames: ["knife"],
      StudentUsernames: ["beo0249@gmail.com"],
      PolicyId: 2,
    };

    const user = {
      Username: "xhunter1412@gmail.com",
      Password: "xhunter1412@gmail.com",
    };

    let token = "waiting for token ...";
    test("get token", async (done) => {
      const result = await request(app.app).post("/api/Auth/Token").send(user);
      expect(result.status).toEqual(200);
      token = result.body.AccessToken;
      done();
    });

    // test("get prohibited items - Remember create one record first", async (done) => {
    //   const result = await request(app.app)
    //     .get("/api/ProhibitedItem")
    //     .set("Authorization", token);
    //   expect(result.status).toEqual(200);
    //   expect((result.body as Array<any>).length).toBeGreaterThanOrEqual(0);
    //   dangerous_case.ProhibitedItemIds = [];
    //   dangerous_case.ProhibitedItemIds.push(result.body[0].Id);
    //   done();
    // });

    test("get students - Remember create one record first", async (done) => {
      const result = await request(app.app)
        .get("/api/Student")
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      expect((result.body as Array<any>).length).toBeGreaterThanOrEqual(0);
      dangerous_case.StudentIds = [];
      dangerous_case.StudentIds.push(result.body[0].Id);
      done();
    });

    test("POST new dangerous case", async (done) => {
      const result = await request(app.app)
        .post("/api/DangerousCase")
        .send(dangerous_case)
        .set("Authorization", token);
      // console.log("result.body.message:" + result.body);
      // expect(result.body).toEqual(201);
      expect(result.status).toEqual(201);
      dangerous_case.Id = result.body.Id;
      dangerous_case.CreatedAt = result.body.CreatedAt;
      delete dangerous_case.CaseImage
      delete dangerous_case.Level
      done();
    });

    test("GET ALL dangerous case", async (done) => {
      const result = await request(app.app)
        .get("/api/DangerousCase")
        .set("Authorization", token);
      // expect(result.body).toContainEqual(plainToClass(DangerousCaseVM, dangerous_case, { excludeExtraneousValues: true }));
      expect(result.body.filter((e:any) => e.Code === dangerous_case.Code).length).toBeGreaterThanOrEqual(1);
      // expect(result.body).toBeGreaterThanOrEqual(1);
      done();
    });

    const firstStep = {
      Subject: 'New',
      Content: 'The new dangerous case',
      StatusName: "Pending",
      StatusOrder: 0
  }

    test("Get by Id", async (done) => {
      const result = await request(app.app)
        .get(`/api/DangerousCase/${dangerous_case.Id}`)
        // .get(`/api/DangerousCase/7`)
        .set("Authorization", token);
      // expect(result.body.CaseHistories).toContainEqual(firstStep);
      expect(result.body.CaseHistories.filter((history:any) => 
      history.StatusOrder == firstStep.StatusOrder
      && history.StatusName == firstStep.StatusName
      ).length).toBeGreaterThanOrEqual(1);
      done();
    });

    const nextStep: any = {
        Subject: 'Approve',
        Content: 'The dangerous case have been Approve',
    }

    test("Get a approve history step", async (done) => {
      const result = await request(app.app)
        .get(`/api/CaseHistoryStatus?name=Approve`)//Approve
        .set("Authorization", token);
      expect(result.status).toEqual(200);
      expect(result.body[0].Name).toEqual("Approve");
      nextStep.StatusId = result.body[0].Id;
      nextStep.StatusOrder = result.body[0].Order;
      nextStep.CaseId = dangerous_case.Id;
      done();
    });

    // STEP 2
    test("Add new step in the dangerous", async (done) => {
        const result = await request(app.app)
          .put(`/api/DangerousCase/Step`).send(nextStep)
          .set("Authorization", token);
        expect(result.status).toEqual(200);
        done();
      });

      test("Get by Id ver 2", async (done) => {
        const result = await request(app.app)
          .get(`/api/DangerousCase/${dangerous_case.Id}`)
          .set("Authorization", token);
        // expect(result.body.CaseHistories).toContainEqual(firstStep);
        expect(result.body.CaseHistories.filter((history:any) => 
        history.StatusOrder == nextStep.StatusOrder
        ).length).toBeGreaterThanOrEqual(1);
        done();
      });
  
      // test("Delete dangerous case", async (done) => {
      //   const result = await request(app.app)
      //     .delete(`/api/DangerousCase/${dangerous_case.Id}`)
      //     .set("Authorization", token);
      //   expect(result.status).toEqual(200);
      //   // expect(result.body.length).toEqual(2);
      //   done();
      // });

    afterAll(async (done) => {
      await context.disconnect();
      done();
    });
  });
})();
