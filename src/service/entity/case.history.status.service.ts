import { Sequelize } from "sequelize-typescript";
import { CaseHistoryStatus } from "./../../model";
import { BaseService,IService } from '../generic';

export interface ICaseHistoryStatusService extends IService<CaseHistoryStatus> {
}

export class CaseHistoryStatusService extends BaseService<CaseHistoryStatus> implements ICaseHistoryStatusService {
    constructor(sequelize: Sequelize) {
        super(CaseHistoryStatus, sequelize);
    }
}
