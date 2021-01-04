import { Sequelize } from "sequelize-typescript";
import { CaseHistoryStatus, CaseImage } from "./../../model";
import { BaseService,IService } from '../generic';

export interface ICaseImageService extends IService<CaseImage> {
}

export class CaseImageService extends BaseService<CaseImage> implements ICaseImageService {
    constructor(sequelize: Sequelize) {
        super(CaseImage, sequelize);
    }
}
