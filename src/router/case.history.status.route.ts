import { AuthService } from '../service/entity/auth.service';
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { CaseHistoryStatusController } from "../controller/case.history.status.controller";

export const CaseHistoryStatusRoute = (app: Application, sequelize: Sequelize) => {
    const CONTROLLER = new CaseHistoryStatusController(sequelize);
    const AUTH = new AuthService(sequelize).authorize;
    app.route("/api/CaseHistoryStatus",)
        .get((req, res) => {
            CONTROLLER.getAll(req, res);
        });
};
