import { Sequelize } from "sequelize-typescript";
import { University } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IUniversityRepository extends IRepository<University> {
}

export class UniversityRepository extends BaseRepository<University> implements IUniversityRepository {
    constructor(sequelize: Sequelize) {
        super(University, sequelize);
    }
}
