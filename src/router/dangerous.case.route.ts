import { AuthService } from "../service/entity/auth.service";
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { DangerousCaseController } from "../controller/dangerous.case.controller";
const Multer = require("multer");

export const DangerousCaseRoute = (app: Application, sequelize: Sequelize) => {
    const CONTROLLER = new DangerousCaseController(sequelize);
    const AUTH = new AuthService(sequelize).authorize;
    const UPLOAD_FIREBASE = Multer({
        storage: Multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
        },
    });
    app.route("/api/DangerousCase/Image/:CaseImageId")
        .get((req, res) => {
            CONTROLLER.getImageByCaseImageId(req, res);
        })
    app.route("/api/DangerousCase/Step")
        .put(AUTH, (req, res) => {
            CONTROLLER.updateStep(req, res);
        });
    app.route("/api/DangerousCase")
        .get(AUTH, (req, res) => {
            CONTROLLER.getAll(req, res);
        })
        .post(AUTH, (req, res) => {
            CONTROLLER.create(req, res);
        });
    app.route("/api/DangerousCaseByStudent")
        .get(AUTH, (req, res) => {
            CONTROLLER.getByStudent(req, res);
        })
    app.route("/api/DangerousCase/Student").post(AUTH, (req, res) => {
        // CONTROLLER.create(req, res);
        CONTROLLER.studentCreate(req, res);
    });
    app.route("/api/DangerousCase/Daily").get(AUTH, (req, res) => {
        // CONTROLLER.create(req, res);
        CONTROLLER.getDangerousCaseDaily(req, res);
    });
    app.route("/api/DangerousCase/:id")
        .get(AUTH, (req, res) => {
            CONTROLLER.getById(req, res);
        })
        .put(UPLOAD_FIREBASE.single("fileCase"), AUTH, (req, res) => {
            CONTROLLER.uploadFileCase(req, res);
        })
        .delete(AUTH, (req, res) => {
            CONTROLLER.delete(req, res);
        });

};
