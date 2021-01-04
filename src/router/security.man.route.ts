import { AuthService } from '../service/entity/auth.service';
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { SecurityManController } from "../controller/security.man.controller";
import multer from 'multer';
const Multer = require('multer');
export const SecurityManRoute = (app: Application, sequelize: Sequelize) => {
    const CONTROLLER = new SecurityManController(sequelize);
    const AUTH = new AuthService(sequelize).authorize;

    app.route("/api/SecurityGuard")
    .get((req, res) => {
      CONTROLLER.getAll(req, res);
    })
    .put(AUTH, (req, res) => {
      CONTROLLER.update(req, res);
    })
    app.route("/api/SecurityGuard/buildingGuard")
    .get(AUTH, (req, res) => {
      CONTROLLER.getBuildingGuard(req, res);
    })
    app.route("/api/SecurityGuard/List")
    .post(AUTH,(req, res) => {
      CONTROLLER.createListSecurityGuard(req, res);
    })
}


