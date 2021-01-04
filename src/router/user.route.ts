import { AuthService } from './../service/entity/auth.service';
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { UserController } from "../controller/user.controller";
import NodeCache from "node-cache";
// import multer from 'multer';
const Multer = require('multer');


export const UserRoute = (app: Application, sequelize: Sequelize,memCache: NodeCache, io:SocketIO.Server) => {
  const CONTROLLER = new UserController(sequelize,memCache,io);
  const AUTH = new AuthService(sequelize).authorize;
  const UPLOAD_FIREBASE = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
  });
  // const uploadStorage = multer({
  //   limits: {
  //     fileSize: 30 * 1024 * 1024, // no larger than 30mb, you can change as needed.
  //   },
  //   fileFilter(req, file, cb) {
  //     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
  //       return cb(new Error("Please upload an image"))
  //     }
  //     cb(null, true);
  //   }
  // });

  app.route("/api/DeactiveUser/FaceImages")
    .get((req, res) => {
      CONTROLLER.getAllDeactivate(req, res);
    });
  app.route("/api/User")
    .get((req, res) => {
      CONTROLLER.getAll(req, res);
    })
    .post((req, res) => {
      CONTROLLER.create(req, res);
    })
    .put(AUTH, (req, res) => {
      CONTROLLER.update(req, res);
    });
  app.route("/api/User/FaceImages")
    .get((req, res) => {
      CONTROLLER.getAllUserFaceImage(req, res);
      // CONTROLLER.getAll(req, res);
    })
    .put((req, res) => {
      CONTROLLER.removeFaceImage(req, res);
    });
  app.route("/api/User/SecurityGuard/FaceImages")
    .get((req, res) => {
      CONTROLLER.getAllSecurityManFaceImage(req, res);
      // CONTROLLER.getAll(req, res);
    });
  app.route("/api/User/FaceImageEnhances")
    .get((req, res) => {
      CONTROLLER.getAllFaceImageEnhance(req, res);
      // CONTROLLER.getAll(req, res);
    });
  app.route("/api/User/FaceCheckYPR")
    .post((req, res) => {
      CONTROLLER.FaceCheckYPR(req, res);
      // CONTROLLER.getAll(req, res);
    });
  app.route("/api/User/:id",)
    .get((req, res) => {
      CONTROLLER.getById(req, res);
    })
    .delete((req, res) => {
      CONTROLLER.delete(req, res);
    })
  app.route("/api/User/Code/:Code",)
    .get((req, res) => {
      CONTROLLER.getByCode(req, res);
    })
  app.route("/api/User/:id/Avatar",)
    .get((req, res) => {
      CONTROLLER.getUserAvatar(req, res);
    })
  
  app.route("/api/User/Avatar/:id",)
    .put(UPLOAD_FIREBASE.single('avatarImage'), AUTH, (req, res) => {
      CONTROLLER.updateUserAvatar(req, res);
    });
    app.route("/api/User/Avatar",)
    .put(UPLOAD_FIREBASE.single('avatarImage'), AUTH, (req, res) => {
      CONTROLLER.updateUserAvatar(req, res);
    });
  app.route("/api/User/Register")
    .post((req, res) => {
      CONTROLLER.register(req, res);
    });
  app.route("/api/User/RegisterFace")
    .put(AUTH, (req, res) => {
      CONTROLLER.registerFace(req, res);
    });
  app.route("/api/User/:id/SwitchActive")
    .put(AUTH, (req, res) => {
      CONTROLLER.switchActive(req, res);
    });

};
