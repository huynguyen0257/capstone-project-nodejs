import { Sequelize } from "sequelize-typescript";
import { PolicyLevel } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IPolicyLevelRepository extends IRepository<PolicyLevel> {
}

export class PolicyLevelRepository extends BaseRepository<PolicyLevel> implements IPolicyLevelRepository {
    constructor(sequelize: Sequelize) {
        super(PolicyLevel, sequelize);
    }
}
