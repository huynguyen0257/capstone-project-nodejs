import { Sequelize } from "sequelize-typescript";
import { User } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IUserRepository extends IRepository<User> {
}

export class UserRepository extends BaseRepository<User> implements IUserRepository {
    constructor(sequelize: Sequelize) {
        super(User, sequelize);
    }
}
