import { Sequelize } from "sequelize-typescript";
import { Role } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IRoleService extends IService<Role> {
}

export class RoleService extends BaseService<Role> implements IRoleService {
    constructor(sequelize: Sequelize) {
        super(Role, sequelize);
    }
}
