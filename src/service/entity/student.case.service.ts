import { Sequelize } from "sequelize-typescript";
import { StudentCase } from "../../model";
import { BaseService,IService } from '../generic';

export interface IStudentCaseService extends IService<StudentCase> {
}

export class StudentCaseService extends BaseService<StudentCase> implements IStudentCaseService {
    constructor(sequelize: Sequelize) {
        super(StudentCase, sequelize);
    }
}
