import { AuthService } from '../service/entity/auth.service';
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { DeviceTokenController } from "../controller/device.token.controller";

export const DeviceTokenRoute = (app: Application, sequelize: Sequelize) => {
    const CONTROLLER = new DeviceTokenController(sequelize);
    const AUTH = new AuthService(sequelize).authorize;
    app.route("/api/DeviceToken/User",)
        .get(AUTH, (req, res) => {
            CONTROLLER.getByUserId(req, res);
        })
    app.route("/api/DeviceToken",)
        .get(AUTH,(req, res) => {
            CONTROLLER.getAll(req, res);
        })
        .post(AUTH, (req, res) => {
            CONTROLLER.create(req, res);
        })
        .put((req, res) => {
            CONTROLLER.update(req, res);
        });
    app.route("/api/DeviceToken/:id",)
        .get(AUTH,(req, res) => {
            CONTROLLER.getById(req, res);
        })
        .delete(AUTH,(req, res) => {
            CONTROLLER.delete(req, res);
        });
    
};
