import { AuthService } from "./../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { BuildingController } from "../controller/building.controller";
const Multer = require("multer");
const UPLOAD_FIREBASE = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
}); 

export const BuildingRoute = (app: Application, sequelize: Sequelize) => {
  const CONTROLLER = new BuildingController(sequelize);
  const AUTH = new AuthService(sequelize).authorize;

  app.route("/api/Building").get( (req, res) => {
    CONTROLLER.getAll(req, res);
  })
    .put(AUTH, (req, res) => {  
      CONTROLLER.update(req, res);
    });
  app.route("/api/Building/Guard").get(AUTH, (req, res) => {
    CONTROLLER.getBuildingByGuard(req, res);
  });
  app.route("/api/Building/:Id").get(AUTH, (req, res) => {
    CONTROLLER.getById(req, res);
  });
  app.route("/api/Building/Image/:Id")
  .put(UPLOAD_FIREBASE.single('buildingImage'), AUTH, (req, res) => {
    CONTROLLER.updateBuildingImage(req, res);
  });

  app.route("/api/Building/List").post(AUTH, (req, res) => {
    CONTROLLER.createList(req, res);
  });

  app.route("/api/Building/:Id/Camera").get(AUTH, (req, res) => {
    CONTROLLER.getCamera(req, res);
  });
};

