import { BelongsTo, Column, CreatedAt, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement, ForeignKey } from "sequelize-typescript";
import { Building } from "./building";
import { CaseHistory } from "./case-history";
import { CaseImage } from "./case-image";
import { Notification } from "./notification";
import { Policy } from "./policy";
import { ProhibitedItemCase } from "./prohibited-item-case";
import { StudentCase } from "./student-case";

@Table
export class DangerousCase extends Model<DangerousCase> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Unique
    @Column
    public Code!: string;
    
    @Column
    public Location!: string;
    
    @Column
    public CreatedBy!: string;

    @Column
    public UpdatedBy?: string;

    @UpdatedAt
    public UpdatedAt?: Date;

    @CreatedAt
    public CreatedAt!: Date;

    @Column
    public CurrentStatusId!: number;

    @HasMany(() => CaseImage)
    public CaseImages!: CaseImage[];
    
    @HasMany(() => CaseHistory)
    public CaseHistories!: CaseHistory[];
    
    @HasMany(() => ProhibitedItemCase)
    public ProhibitedItemCases?: ProhibitedItemCase[];

    @HasMany(() => StudentCase)
    public StudentCases?: StudentCase[];

    @AllowNull(false)
    @ForeignKey(() => Policy)
    @Column
    public PolicyId!: number;
 
    @BelongsTo(() => Policy, "PolicyId")
    public Policy!: Policy;
    
    @ForeignKey(() => Building)
    public BuildingId!: number;

    @BelongsTo(() => Building, "BuildingId")
    public Building!: Building;
}
