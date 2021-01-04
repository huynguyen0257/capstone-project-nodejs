import { Sequelize } from "sequelize-typescript";
import { Role } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IRoleRepository extends IRepository<Role> {
}

export class RoleRepository extends BaseRepository<Role> implements IRoleRepository {
    constructor(sequelize: Sequelize) {
        super(Role, sequelize);
    }
}
