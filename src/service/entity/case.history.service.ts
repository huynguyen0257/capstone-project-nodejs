import { Sequelize } from "sequelize-typescript";
import { CaseHistory } from "./../../model";
import { BaseService,IService } from '../generic';

export interface ICaseHistoryService extends IService<CaseHistory> {
}

export class CaseHistoryService extends BaseService<CaseHistory> implements ICaseHistoryService {
    constructor(sequelize: Sequelize) {
        super(CaseHistory, sequelize);
    }
}
