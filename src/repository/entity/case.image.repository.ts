import { Sequelize } from "sequelize-typescript";
import { CaseImage } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface ICaseImageRepository extends IRepository<CaseImage> {
}

export class CaseImageRepository extends BaseRepository<CaseImage> implements ICaseImageRepository {
    constructor(sequelize: Sequelize) {
        super(CaseImage, sequelize);
    }
}
