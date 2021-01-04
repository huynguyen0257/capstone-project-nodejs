import { AuthService } from "../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { DashboardController } from "../controller/dashboard.controller";

export const DashboardRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new DashboardController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;
  app.route("/api/Dashboard/DangerousCaseGroupByPolicy").get(AUTH,(req, res) => {
    CONTROLLER.getDangerousCaseGroupByPolicy(req, res);
  });
  app.route("/api/Dashboard/Building/:Id/DangerousCaseGroupByPolicy").get(AUTH,(req, res) => {
    CONTROLLER.getDangerousCaseGroupByPolicyByBuilding(req, res);
  });
  app.route("/api/Dashboard/NumberOfDangerousCaseByMonth").get(AUTH,(req, res) => {
    CONTROLLER.getNumberOfDangerousCaseByMonth(req, res);
  });
  app.route("/api/Dashboard/Building/:Id/NumberOfDangerousCaseByMonth").get(AUTH,(req, res) => {
    CONTROLLER.getNumberOfDangerousCaseByMonthByBuilding(req, res);
  });
  app.route("/api/Dashboard/Building/:Id/RegisterStudentStatus").get(AUTH,(req, res) => {
    CONTROLLER.getRegisteredStudentByBuilding(req, res);
  });
  app.route("/api/Dashboard/Building/:Id/NumberOfStudentGroupByUniversityByBuilding").get(AUTH,(req, res) => {
    CONTROLLER.getNumberOfStudentGroupByUniversityByBuilding(req, res);
  });
  app.route("/api/Dashboard/NumberOfStudentGroupByBuilding").get(AUTH,(req, res) => {
    CONTROLLER.getNumberOfStudentGroupByBuilding(req, res);
  });
  app.route("/api/Dashboard/NumberOfCaseGroupByBuilding").get(AUTH,(req, res) => {
    CONTROLLER.getDangerousCaseGroupByBuilding(req, res);
  });
  app
    .route("/api/Dashboard/NumberOfStudentGroupByUniversity")
    .get(AUTH,(req, res) => {
      CONTROLLER.getNumberOfStudentGroupByUniversity(req, res);
    });
  app
    .route("/api/Dashboard/Student/DangerousCasePeriod")
    .get(AUTH, (req, res) => {
      CONTROLLER.getDangerousCasePeriod(req, res);
    });

    app
    .route("/api/Dashboard/RegisterStudentStatus")
    .get(AUTH, (req, res) => {
      CONTROLLER.getRegistedStudent(req, res);
    });
    app
    .route("/api/Dashboard/RegisterGuardStatus")
    .get( (req, res) => {
      CONTROLLER.getRegistedGuard(req, res);
    });
};
