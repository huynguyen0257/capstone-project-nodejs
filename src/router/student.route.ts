import { AuthService } from './../service/entity/auth.service';
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { StudentController } from "../controller/student.controller";
const Multer = require('multer');


export const StudentRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new StudentController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;

  app.route("/api/Student/List")
    .post(AUTH, (req, res) => {
      CONTROLLER.createListStudent(req, res).then((data) => {
      });
    });
  app.route("/api/Student")
    .get(AUTH, (req, res) => {
      CONTROLLER.getAll(req, res);
    }) 

  // .put((req, res) => {
  //   CONTROLLER.registerStudentToEnterDorm(req, res)
  // });
  app.route("/api/Student/DangerousCase",)
    .get(AUTH, (req, res) => {
      CONTROLLER.getDangerousCase(req, res);
    });

  app.route("/api/Student/DangerousCaseDaily",)
    .get(AUTH, (req, res) => {
      CONTROLLER.getDangerousCaseDaily(req, res);
    });
  app.route("/api/Student/:id",)
    .get(AUTH, (req, res) => {
      CONTROLLER.getById(req, res);
    });

};
