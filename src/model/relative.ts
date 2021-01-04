import { BelongsTo, Column, CreatedAt, Default, ForeignKey, HasMany, IsUUID, Model, PrimaryKey, Table, UpdatedAt, AutoIncrement, AllowNull } from "sequelize-typescript";
import { RelativeFaceImage } from "./relative-face-image";
import { Student } from "./student";

@Table
export class Relative extends Model<Relative> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public Name!: string;

    @AllowNull(false)
    @Column
    public Age!: number;

    @AllowNull(false)
    @Column
    public Gender!: boolean;
    
    @Column
    public Avatar!: string;

    @AllowNull(false)
    @Column
    public IdentityCardNumber!: string;
    
    @Column
    public FrontIdentityCardImage!: string;
    
    @Column
    public BackIdentityCardImage!: string;

    @AllowNull(false)
    @Column
    public IsCheckout!: boolean;
    
    @AllowNull(false)
    @Column
    public TimeIn!: Date;

    @Column
    public TimeOut!: Date;

    @ForeignKey(() => Student)
    @Column
    public StudentId!: number;
 
    @BelongsTo(() => Student, "StudentId")
    public Student!: Student;

    @HasMany(() => RelativeFaceImage)
    public RelativeFaceImages?: RelativeFaceImage[];
}
