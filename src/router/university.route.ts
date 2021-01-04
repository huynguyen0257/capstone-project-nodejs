import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { UniversityController } from "../controller/university.controller";
const Multer = require("multer");

export const UniversityRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new UniversityController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;

  app
    .route("/api/University")
    .get((req, res) => {
      CONTROLLER.getAll(req, res);
    })
    .post((req, res) => {
      CONTROLLER.create(req, res);
    })
    .put((req, res) => {
      CONTROLLER.update(req, res);
    });
  app.route("/api/University/:id").get((req, res) => {
    CONTROLLER.getById(req, res);
  });
};
