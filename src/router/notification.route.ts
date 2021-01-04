import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { NotificationController } from "../controller/notification.controller";
const Multer = require("multer");

export const NotificationRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new NotificationController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;

  app.route("/api/notification/MarkAllRead")
    .put(AUTH, (req, res) => {
      CONTROLLER.markAllRead(req, res);
    });

  app.route("/api/notification").get(AUTH, (req, res) => {
    CONTROLLER.getByUserId(req, res);
  });

  app.route("/api/notification/:id").put(AUTH, (req, res) => {
    CONTROLLER.updateRead(req, res);
  });

  
};
