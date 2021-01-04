import { AuthService } from './../service/entity/auth.service';
import { Application } from "express";
import { Sequelize, Model } from "sequelize-typescript";
import { RoleController } from "../controller/Role.controller";

export const RoleRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new RoleController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;
  
  app.route("/api/Role").get((req, res) => {
    CONTROLLER.getAll(req, res);
  })
};
