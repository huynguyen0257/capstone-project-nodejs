import { Column, Default, HasMany, AllowNull, Model, PrimaryKey, Table, Unique, Length, AutoIncrement } from "sequelize-typescript";
import {Student} from "./student"
@Table
export class University extends Model<University> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public Name!: string;

    @Default(false)
    @Column
    public IsDelete!: boolean;

    @HasMany(() => Student)
    public Student?: Student[];
}
