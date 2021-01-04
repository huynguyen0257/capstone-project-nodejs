import { Sequelize } from "sequelize-typescript";
import { DeviceToken } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IDeviceTokenRepository extends IRepository<DeviceToken> {
}

export class DeviceTokenRepository extends BaseRepository<DeviceToken> implements IDeviceTokenRepository {
    constructor(sequelize: Sequelize) {
        super(DeviceToken, sequelize);
    }
}
