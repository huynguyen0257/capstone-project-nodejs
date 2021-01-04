import { Sequelize } from "sequelize-typescript";
import { Student } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IStudentRepository extends IRepository<Student> {
}

export class StudentRepository extends BaseRepository<Student> implements IStudentRepository {
    constructor(sequelize: Sequelize) {
        super(Student, sequelize);
    }
}
