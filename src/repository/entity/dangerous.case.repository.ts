import { Model, Repository, Sequelize } from "sequelize-typescript";
import { DangerousCase } from './../../model';
import { IRepository,BaseRepository } from "../generic";
import { GroupOption, WhereOptions } from "sequelize/types";


export interface IDangerousCaseRepository extends IRepository<DangerousCase> {
}

export class DangerousCaseRepository extends BaseRepository<DangerousCase> implements IDangerousCaseRepository {
    constructor(sequelize: Sequelize) {
        super(DangerousCase, sequelize);
    }

    public readonly count = (groupBy: GroupOption, models: Array<Repository<Model>>): Promise<{ [key: string]: number }> => {
        return this.repository.count({ group: groupBy, include: models});
    }
}
