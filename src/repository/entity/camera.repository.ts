import { Sequelize } from "sequelize-typescript";
import { Camera } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface ICameraRepository extends IRepository<Camera> {
}

export class CameraRepository extends BaseRepository<Camera> implements ICameraRepository {
    constructor(sequelize: Sequelize) {
        super(Camera, sequelize);
    }
}
