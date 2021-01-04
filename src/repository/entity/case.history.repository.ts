import { Sequelize } from "sequelize-typescript";
import { CaseHistory } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface ICaseHistoryRepository extends IRepository<CaseHistory> {
}

export class CaseHistoryRepository extends BaseRepository<CaseHistory> implements ICaseHistoryRepository {
    constructor(sequelize: Sequelize) {
        super(CaseHistory, sequelize);
    }
}
