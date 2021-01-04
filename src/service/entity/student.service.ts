import { Sequelize } from "sequelize-typescript";
import { Student } from "./../../model";
import { BaseService, IService } from '../generic';

export interface IStudentService extends IService<Student> {
}

export class StudentService extends BaseService<Student> implements IStudentService {
    constructor(sequelize: Sequelize) {
        super(Student, sequelize);
    }
}
