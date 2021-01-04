import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { PolicyController } from "../controller/policy.controller";

export const PolicyRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new PolicyController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;

  app.route("/api/Policy")
  .get((req, res) => {
    CONTROLLER.getAll(req, res);
  });
};
