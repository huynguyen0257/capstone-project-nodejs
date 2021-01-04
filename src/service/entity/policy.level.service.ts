import { Sequelize } from "sequelize-typescript";
import { PolicyLevel } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IPolicyLevelService extends IService<PolicyLevel> {
}

export class PolicyLevelService extends BaseService<PolicyLevel> implements IPolicyLevelService {
    constructor(sequelize: Sequelize) {
        super(PolicyLevel, sequelize);
    }
}
