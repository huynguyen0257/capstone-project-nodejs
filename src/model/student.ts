import { BelongsTo, Column, ForeignKey, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { Relative } from "./relative";
import { Room } from "./room";
import { StudentCase } from "./student-case";
import { University } from "./university";
import { User } from "./user";

@Table
export class Student extends Model<Student> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public Code!: string;

    @AllowNull(false)
    @ForeignKey(() => University)
    @Column
    public UniversityId!: number;

    @AllowNull(true)
    @Column
    public DayIn!: Date;

    @AllowNull(true)
    @Column
    public DayOut!: Date;
 
    @BelongsTo(() => University, "UniversityId")
    public University!: University;
    
    @AllowNull(false)
    @ForeignKey(() => User)
    @Column
    public UserId!: number;
 
    @BelongsTo(() => User, "UserId")
    public User!: User;
    
    @ForeignKey(() => Room)
    @Column
    public RoomId?: number;
 
    @BelongsTo(() => Room, "RoomId")
    public Room!: Room;

    @HasMany(() => Relative)
    public Relatives?: Relative[];

    @HasMany(() => StudentCase)
    public StudentCases?: StudentCase[];
}
