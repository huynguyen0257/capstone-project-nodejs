
import { Application } from "express";
import { Sequelize } from "sequelize-typescript";
import { UserRoute } from "./user.route";
import { AuthRoute } from "./auth.route";
import { RoleRoute } from "./role.route";
import { NotificationRoute } from "./notification.route";
import { UniversityRoute } from "./university.route";
import { StudentRoute } from "./student.route";
import { DeviceTokenRoute } from "./device.token.route";
import { DangerousCaseRoute } from "./dangerous.case.route";
import { ProhibitedItemRoute } from "./prohibited.item.route";
import { CaseHistoryStatusRoute } from "./case.history.status.route";
import { SecurityManRoute } from "./security.man.route";
import { CameraRoute } from "./camera.route";
import { PolicyLevelRoute } from "./policy.level.route";
import { ConfigurationRoute } from "./configuration.route";
import { PolicyRoute } from "./policy.route";
import { DashboardRoute } from "./dashboard.route";
import socketIO from "socket.io";

import NodeCache from "node-cache";
import { BuildingRoute } from "./building.route";
import { RoomRoute } from "./room.route";
import { RelativeRoute } from "./relative.route";


export const BASE_ROUTERS: Array<(app: Application, sequelize: Sequelize, memCache: NodeCache, io:SocketIO.Server) => void> = [UserRoute, AuthRoute, RoleRoute, 
    NotificationRoute,UniversityRoute, StudentRoute,DeviceTokenRoute, 
    DangerousCaseRoute, CaseHistoryStatusRoute, BuildingRoute, RoomRoute,ProhibitedItemRoute, SecurityManRoute,
    CameraRoute, PolicyLevelRoute, RelativeRoute,ConfigurationRoute,PolicyRoute, DashboardRoute
];
