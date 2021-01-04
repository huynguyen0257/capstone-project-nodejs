import { Sequelize } from "sequelize-typescript";
import { University } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IUniversityService extends IService<University> {
}

export class UniversityService extends BaseService<University> implements IUniversityService {
    constructor(sequelize: Sequelize) {
        super(University, sequelize);
    }
}
