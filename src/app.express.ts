import express, { Application, NextFunction, Request, Response } from "express";
import { Sequelize } from "sequelize-typescript";
import { json, urlencoded } from "body-parser";
import { BASE_ROUTERS } from "./router";
import { readFileSync } from "fs";
import { serve, setup } from "swagger-ui-express";
import { environment } from "./environment";
import { useGetSwaggerJson } from "./util/swagger.util";
import * as swagger from "./swagger.json";
import console from "console";
import path from "path";
const open = require("open");
import { createServer, Server } from "http"; //new
import socketIO from "socket.io";
import { SocketHub } from "./socket/hub";
import NodeCache from 'node-cache'
const bodyParser = require('body-parser');
export class App {
  public app: Application;
  private sequelize: Sequelize;
  private port: string | number;
  private server: Server;
  private io: SocketIO.Server;
  private memCache: NodeCache
  constructor(sequelize: Sequelize) {
    this.port = process.env.PORT || 8888;
    this.sequelize = sequelize;
    this.app = express();
    this.server = createServer(this.app);
    this.io = socketIO(this.server);
    this.io.origins('*:*')
    this.settings();
    this.middleWares();
    this.memCache = new NodeCache()
    this.routes();
    this.swagger();
    
  }

  private settings = () => {
    this.app.use(urlencoded({ limit: "50mb", extended: false }));
    this.app.use(json({ limit: "50mb" }));
    this.app.use(bodyParser.json());
    this.app.set('view engine', 'pug');
    this.app.set("port", process.env.PORT || 8888);
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type,authorization"
      );
      next();
    });
  };

  private middleWares = () => {
    // this.app.use(morgan('dev'));
    this.app.use(express.json());
  };

  private routes = () => {
    BASE_ROUTERS.forEach((route) => route(this.app, this.sequelize, this.memCache, this.io));
  };

  public listen = async (): Promise<void> => {
    await this.server.listen(this.app.get("port"));
    console.log("App is listening on http://localhost:" + this.app.get("port"));
    this.io.on("connection", (socket: any) => {
      console.log("new Web socket connection established");
      const hub = new SocketHub(this.io, socket, this.memCache, this.sequelize);
      hub.settings();
    });
  };

  public swagger = async (): Promise<void> => {
    const swaggerPath = path.join(__dirname, "swagger.json");
    const swaggerJSON = JSON.parse(readFileSync(swaggerPath).toString());
    swaggerJSON.host =
      process.env.NODE_ENV === "development"
        ? "localhost:8888"
        : "sdms-be.azurewebsites.net";
    environment.swagger.forEach(
      (json: {
        name: string;
        data: {
          CM?: {
            properties: any;
            required: string[];
          };
          UM?: {
            properties: any;
            required: string[];
          };
        };
        extension?: {
          name: string;
          data: {
            VM?: any;
            CM?: {
              properties: any;
              required: string[];
            };
            UM?: {
              properties: any;
              required: string[];
            };
          };
        }[];
      }) => {
        const swaggerModel = useGetSwaggerJson(json);
        for (const key in swaggerModel.paths) {
          if (swaggerModel.paths.hasOwnProperty(key)) {
            const element = swaggerModel.paths[key];
            swaggerJSON.paths[key] = element;
          }
        }
        for (const key in swaggerModel.definitions) {
          if (swaggerModel.definitions.hasOwnProperty(key)) {
            const element = swaggerModel.definitions[key];
            swaggerJSON.definitions[key] = element;
          }
        }
      }
    );
    const options = {
      customCss:
        ".swagger-ui table tbody tr td:first-of-type {max-width : 30%} .swagger-ui .parameters-col_description {width:70%}",
      explorer: true,
    };

    this.app.get("/", (req: Request, res: Response) => {
      res.status(301).redirect("/swagger");
    });
    this.app.get("/swagger/v1/swagger.json", (req: Request, res: Response) => {
      res.json(require("./swagger.json"));
    });
    this.app.use("/swagger", serve, setup(swaggerJSON, options));
    open(environment.apiLink.endPoint);
  };
}
