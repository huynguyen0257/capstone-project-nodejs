import { Sequelize } from "sequelize-typescript";
import { Policy } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IPolicyService extends IService<Policy> {
}

export class PolicyService extends BaseService<Policy> implements IPolicyService {
    constructor(sequelize: Sequelize) {
        super(Policy, sequelize);
    }
}
