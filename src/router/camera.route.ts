import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { CameraController } from "../controller/Camera.controller";
import NodeCache from "node-cache";

export const CameraRoute = (app: Application, sequelize: Sequelize, memCache: NodeCache, io: SocketIO.Server) => {
  const CONTROLLER = new CameraController(sequelize, memCache, io);
  const AUTH = new AuthService(sequelize).authorize;

  app.route("/api/Camera").get(AUTH, (req, res) => {
    CONTROLLER.getAll(req, res);
  }).post(AUTH, (req, res) => {
    CONTROLLER.create(req, res);
  }).put(AUTH, (req, res) => {
    CONTROLLER.update(req, res);
  });
  app.route("/api/Camera/:Id").delete(AUTH, (req, res) => {
    CONTROLLER.delete(req, res);
  });
  app.route("/api/Camera/:Id/Enable").put(AUTH, (req, res) => {
    CONTROLLER.enableStatus(req, res);
  });
  app.route("/api/Camera/:Id/Disable").put(AUTH, (req, res) => {
    CONTROLLER.disableStatus(req, res);
  });

  app.route("/api/Camera/Test").post(AUTH, (req, res) => {
    CONTROLLER.demo(req, res);
  });
};
