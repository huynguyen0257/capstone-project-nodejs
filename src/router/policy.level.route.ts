import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { PolicyLevelController } from "../controller/policy.level.controller";

export const PolicyLevelRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new PolicyLevelController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;

  app.route("/api/PolicyLevel")
  .get((req, res) => {
    CONTROLLER.getAll(req, res);
  });
};
