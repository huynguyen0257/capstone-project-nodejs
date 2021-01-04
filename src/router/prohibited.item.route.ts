import { AuthService } from './../service/entity/auth.service';
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { ProhibitedItemController } from "../controller/prohibited.item.controller";
const Multer = require('multer');


export const ProhibitedItemRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new ProhibitedItemController(sequelize);
//   const AUTH = new AuthService(sequelize).authorize;

app.route("/api/ProhibitedItem")
    .get((req, res) => {
      CONTROLLER.getAll(req, res);
    })
    .post((req, res) => {
      CONTROLLER.create(req, res);
    })
    .put((req, res) => {
        CONTROLLER.update(req, res);
    })
};


