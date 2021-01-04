import { Sequelize } from "sequelize-typescript";
import { UserFaceImage } from '../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IUserFaceImageRepository extends IRepository<UserFaceImage> {
}

export class UserFaceImageRepository extends BaseRepository<UserFaceImage> implements IUserFaceImageRepository {
    constructor(sequelize: Sequelize) {
        super(UserFaceImage, sequelize);
    }
}
