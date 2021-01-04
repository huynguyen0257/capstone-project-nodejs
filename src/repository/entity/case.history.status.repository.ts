import { Sequelize } from "sequelize-typescript";
import { CaseHistoryStatus } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface ICaseHistoryStatusRepository extends IRepository<CaseHistoryStatus> {
}

export class CaseHistoryStatusRepository extends BaseRepository<CaseHistoryStatus> implements ICaseHistoryStatusRepository {
    constructor(sequelize: Sequelize) {
        super(CaseHistoryStatus, sequelize);
    }
}
