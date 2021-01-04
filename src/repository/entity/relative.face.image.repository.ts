import { Sequelize } from "sequelize-typescript";
import { RelativeFaceImage } from '../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IRelativeFaceImageRepository extends IRepository<RelativeFaceImage> {
}

export class RelativeFaceImageRepository extends BaseRepository<RelativeFaceImage> implements IRelativeFaceImageRepository {
    constructor(sequelize: Sequelize) {
        super(RelativeFaceImage, sequelize);
    }
}
