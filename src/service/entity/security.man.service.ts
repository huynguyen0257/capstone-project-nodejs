import { Sequelize } from "sequelize-typescript";
import { SecurityMan } from "../../model";
import { BaseService,IService } from '../generic';

export interface ISecurityManService extends IService<SecurityMan> {
}

export class SecurityManService extends BaseService<SecurityMan> implements ISecurityManService {
    constructor(sequelize: Sequelize) {
        super(SecurityMan, sequelize);
    }
}
