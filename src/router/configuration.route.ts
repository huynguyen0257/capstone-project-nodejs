import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { ConfigurationController } from "../controller/configuration.controller";
import NodeCache from "node-cache";
const Multer = require("multer");

export const ConfigurationRoute = (app: Application, sequelize: Sequelize, memCache: NodeCache) => {
  const CONTROLLER = new ConfigurationController(sequelize, memCache);
  const AUTH = new AuthService(sequelize).authorize;

  app
    .route("/api/Configuration")
    .get((req, res) => {
      CONTROLLER.getAll(req, res);
    })
    .post(AUTH, (req, res) => {
      CONTROLLER.create(req, res);
    })
    .put(AUTH, (req, res) => {
      CONTROLLER.update(req, res);
    });
  app.route("/api/Configuration/:Key").get(AUTH, (req, res) => {
    CONTROLLER.getByKey(req, res);
  });
};
