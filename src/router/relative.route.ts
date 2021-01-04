import { AuthService } from './../service/entity/auth.service';
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { RelativeController } from "../controller/Relative.controller";
import NodeCache from 'node-cache';

export const RelativeRoute = (app: Application, sequelize: Sequelize,memCache: NodeCache, io:SocketIO.Server) => {
  const CONTROLLER = new RelativeController(sequelize,memCache,io);
  const AUTH = new AuthService(sequelize).authorize;
  
  app.route("/api/Relative")
  .get(AUTH,(req, res) => {
    CONTROLLER.getByIdentityCardNumber(req, res); 
  })
  .post(AUTH,(req, res) => {
    CONTROLLER.create(req, res);
  })
  app.route("/api/Relative/:id/checkOut")
  .put(AUTH,(req, res) => {
    CONTROLLER.checkOut(req, res);
  })
 
  app.route("/api/Relative/FaceImages")
    .get((req, res) => {
      CONTROLLER.getAllRelativeFaceImage(req, res);
    });
  app.route("/api/Relatives").get(AUTH,(req, res) => {
    CONTROLLER.getAll(req, res);
  })

  app.route("/api/Relative/RegisterFace").put(AUTH,(req, res) => {
    CONTROLLER.registerFace(req, res);
  })
  

};
