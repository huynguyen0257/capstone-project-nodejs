import { Sequelize } from "sequelize-typescript";
import { Relative } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IRelativeRepository extends IRepository<Relative> {
}

export class RelativeRepository extends BaseRepository<Relative> implements IRelativeRepository {
    constructor(sequelize: Sequelize) {
        super(Relative, sequelize);
    }
}
