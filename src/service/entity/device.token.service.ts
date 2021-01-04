import { Sequelize } from "sequelize-typescript";
import { DeviceToken } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IDeviceTokenService extends IService<DeviceToken> {
}

export class DeviceTokenService extends BaseService<DeviceToken> implements IDeviceTokenService {
    constructor(sequelize: Sequelize) {
        super(DeviceToken, sequelize);
    }
}
