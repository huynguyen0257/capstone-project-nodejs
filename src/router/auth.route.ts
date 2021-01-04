import { Application } from "express";
import NodeCache from "node-cache";
import { Sequelize, Model } from "sequelize-typescript";
import { AuthController } from "./../controller/auth.controller";
import { AuthService } from "./../service/entity";

export const AuthRoute = (app: Application, sequelize: Sequelize, memCache: NodeCache) => {
    const AUTH = new AuthService(sequelize).authorize;
    const CONTROLLER = new AuthController(sequelize, memCache);
    app.route("/api/Auth").get(AUTH, (req, res) => {
        CONTROLLER.useCheckToken(req, res);
    }).put(AUTH, (req, res) => {
        CONTROLLER.changePassword(req, res)
    })
    app
        .route("/api/Auth/Token")
        .post((req, res) => {
            CONTROLLER.login(req, res);
        })
    app
    .route("/api/Auth/ResetCode")
    .get((req, res) => {
        CONTROLLER.getResetCode(req, res);
    })
    app
    .route("/api/Auth/CheckResetCode")
    .post((req, res) => {
        CONTROLLER.checkResetCode(req, res);
    })
    app
    .route("/api/Auth/TestCache")
    .get((req, res) => {
        CONTROLLER.testMemCache(req, res);
    })
    app
    .route("/api/Auth/ResetPassword")
    .post((req, res) => {
        CONTROLLER.postResetPassword(req, res);
    })
    app
    .route("/api/Auth/LogOut")
    .post(AUTH, (req, res) => {
        CONTROLLER.logOut(req, res);
    })
};
