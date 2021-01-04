import { BelongsTo, Column, ForeignKey, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { Building } from "./building";
import { Student } from "./student";
import { University } from "./university";

@Table
export class Room extends Model<Room> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Unique
    @Column
    public Code!: string;

    @AllowNull(false)
    @Column
    public Floor!: number;

    @AllowNull(false)
    @Column
    public NumberOfStudent!: number;

    @AllowNull(false)
    @Column
    public CurrentStudent!: number;

    @ForeignKey(() => Building)
    @Column
    public BuildingId!: number;
 
    @BelongsTo(() => Building, "BuildingId")
    public Building!: Building;
    
    @HasMany(() => Student)
    public Students?: Student[];

    // @BelongsTo(() => Room, "RoomId")
    // public RoomId!: number;
}
