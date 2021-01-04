import { Sequelize } from "sequelize-typescript";
import { Camera } from "./../../model";
import { BaseService,IService } from '../generic';

export interface ICameraService extends IService<Camera> {
}

export class CameraService extends BaseService<Camera> implements ICameraService {
    constructor(sequelize: Sequelize) {
        super(Camera, sequelize);
    }
    // public readonly getFaceRegisterPlus = (code : string,): Promise<T[]> => {
    //     return this.repository.getAll(expression, models, orderBys);
    // }

}
