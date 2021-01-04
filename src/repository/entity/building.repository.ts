import { Sequelize } from "sequelize-typescript";
import { Building } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IBuildingRepository extends IRepository<Building> {
}

export class BuildingRepository extends BaseRepository<Building> implements IBuildingRepository {
    constructor(sequelize: Sequelize) {
        super(Building, sequelize);
    }
}
