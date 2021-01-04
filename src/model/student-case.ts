import { BelongsTo, Column, CreatedAt, ForeignKey, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { DangerousCase, Student } from ".";

@Table
export class StudentCase extends Model<StudentCase> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @ForeignKey(() => DangerousCase)
    @AllowNull(false)
    @Column
    public CaseId!: number;
 
    @BelongsTo(() => DangerousCase, "CaseId")
    public DangerousCase!: DangerousCase;

    @ForeignKey(() => Student)
    @AllowNull(false)
    @Column
    public StudentId!: number;
 
    @BelongsTo(() => Student, "StudentId")
    public Student!: Student;

}
