import { Column, CreatedAt, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, ForeignKey, BelongsTo, AutoIncrement } from "sequelize-typescript";
import { DangerousCase } from "./dangerous-case";
import { DeviceToken } from "./device-token";
import { Room } from "./room";
import { SecurityMan } from "./security-man";
@Table
export class Building extends Model<Building> {

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
    public Location!: string;

    @AllowNull(false)
    @Column
    public NumberOfFloor!: number;

    @AllowNull(false)
    @Column
    public NumberOfRoom!: number;

    @AllowNull(false)
    @Column
    public NumberOfStudent!: number;
    
    @AllowNull(false)
    @Column
    public Longitude!: string;
    
    @AllowNull(false)
    @Column
    public Latitude!: string;
   
    @Column
    public ImageUrl!: string;

    @AllowNull(false)
    @Column
    public CreatedBy!: string;

    @Column
    public UpdatedBy?: string;

    @ForeignKey(() => SecurityMan)
    @Column
    public ManagerId?: number;
 
    @BelongsTo(() => SecurityMan, "ManagerId")
    public SecurityMan!: SecurityMan;
    
    @HasMany(() => DangerousCase)
    public DangerousCases?: DangerousCase[];
    
    @HasMany(() => Room)
    public Rooms?: Room[];
}
