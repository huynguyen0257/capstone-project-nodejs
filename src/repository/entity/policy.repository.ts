import { Sequelize } from "sequelize-typescript";
import { Policy } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IPolicyRepository extends IRepository<Policy> {
}

export class PolicyRepository extends BaseRepository<Policy> implements IPolicyRepository {
    constructor(sequelize: Sequelize) {
        super(Policy, sequelize);
    }
}
