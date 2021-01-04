import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { RoomController } from "../controller/room.controller";
const Multer = require("multer");

export const RoomRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new RoomController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;

  app.route("/api/Room").get((req, res) => {
    CONTROLLER.getAll(req, res);
  });
  app.route("/api/Room/:Id",)
    .get(AUTH, (req, res) => {
      CONTROLLER.getById(req, res);
    })
};