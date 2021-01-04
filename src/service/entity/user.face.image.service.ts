import { Sequelize } from "sequelize-typescript";
import { UserFaceImage } from "./../../model";
import { BaseService, IService } from '../generic';
import axios from "axios";
import { environment } from "../../environment";

export interface IUserFaceImageService extends IService<UserFaceImage> {
}

export class UserFaceImageService extends BaseService<UserFaceImage> implements IUserFaceImageService {
    constructor(sequelize: Sequelize) {
        super(UserFaceImage, sequelize);
    }
    public readonly checkYPR = (image: any) => {
        return axios
            .post(`${environment.ai_endpoint}${environment.ai_apiPath.checkYPR}`, {
                "image": image
            })
    }
}
