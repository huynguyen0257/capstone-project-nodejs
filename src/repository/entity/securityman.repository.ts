import { Sequelize } from "sequelize-typescript";
import { SecurityMan } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface ISecurityManRepository extends IRepository<SecurityMan> {
}

export class SecurityManRepository extends BaseRepository<SecurityMan> implements ISecurityManRepository {
    constructor(sequelize: Sequelize) {
        super(SecurityMan, sequelize);
    }
}