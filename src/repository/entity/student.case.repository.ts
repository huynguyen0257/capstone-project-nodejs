import { Sequelize } from "sequelize-typescript";
import { StudentCase } from '../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IStudentCaseRepository extends IRepository<StudentCase> {
}

export class StudentCaseRepository extends BaseRepository<StudentCase> implements IStudentCaseRepository {
    constructor(sequelize: Sequelize) {
        super(StudentCase, sequelize);
    }
}
