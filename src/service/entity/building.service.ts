import { Sequelize } from "sequelize-typescript";
import { Building } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IBuildingService extends IService<Building> {
}

export class BuildingService extends BaseService<Building> implements IBuildingService {
    constructor(sequelize: Sequelize) {
        super(Building, sequelize);
    }
}
