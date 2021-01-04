import { Sequelize } from "sequelize-typescript";
import { User } from "./../../model";
import { BaseService,IService } from '../generic';
import axios from "axios";

export interface IUserService extends IService<User> {
}

export class UserService extends BaseService<User> implements IUserService {
    constructor(sequelize: Sequelize) {
        super(User, sequelize);
    }

    public readonly TriggerCreatedFaceImageToPython = (data: any) => {
        return axios.post("http://localhost:5000/OnSuccessFaceCreated",data);
    }
    public readonly TriggerCheckoutToPython = (data: any) => {
        return axios.post("http://localhost:5000/OnCheckoutSuccess",data);
    }
    public readonly TriggerRemoveFaceImage = (data: any) => {
        return axios.post("http://localhost:5000/OnRemoveFaceImage",data);
    }
    
    
}
