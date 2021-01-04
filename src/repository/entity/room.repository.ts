import { Sequelize } from "sequelize-typescript";
import { Room } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IRoomRepository extends IRepository<Room> {
}

export class RoomRepository extends BaseRepository<Room> implements IRoomRepository {
    constructor(sequelize: Sequelize) {
        super(Room, sequelize);
    }
}
