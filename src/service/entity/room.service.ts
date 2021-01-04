import { Sequelize } from "sequelize-typescript";
import { Room } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IRoomService extends IService<Room> {
}

export class RoomService extends BaseService<Room> implements IRoomService {
    constructor(sequelize: Sequelize) {
        super(Room, sequelize);
    }
}
