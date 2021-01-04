import { BelongsTo, Column, ForeignKey, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { Building } from "./building";

@Table
export class Camera extends Model<Camera> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;
    
    @Column
    public Position!: string;

    @AllowNull(false)
    @Column
    public RtspLink!: string;

    @Column
    public Type!: number;

    @AllowNull(false)
    @Unique
    @Column
    public Code!: string;

    @Column
    public Username!: string;
    
    @Column
    public Password!: string;
    
    @Default(0)
    @Column
    public Status!: number;

    @AllowNull(false)
    @Column
    public SocketId!: string;

    @AllowNull(false)
    @Default(false)
    @Column
    public IsOn!: boolean;

    @AllowNull(false)
    @ForeignKey(() => Building)
    @Column
    public BuildingId!: number;
 
    @BelongsTo(() => Building, "BuildingId")
    public Building!: Building;

}
