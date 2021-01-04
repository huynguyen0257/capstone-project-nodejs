import { Sequelize } from "sequelize-typescript";
import { RelativeFaceImage } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IRelativeFaceImageService extends IService<RelativeFaceImage> {
}

export class RelativeFaceImageService extends BaseService<RelativeFaceImage> implements IRelativeFaceImageService {
    constructor(sequelize: Sequelize) {
        super(RelativeFaceImage, sequelize);
    }
}
