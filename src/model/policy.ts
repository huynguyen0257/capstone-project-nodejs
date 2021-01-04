import { BelongsTo, Column, CreatedAt, ForeignKey, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { CaseHistory } from "./case-history";
import { DangerousCase } from "./dangerous-case";
import { PolicyLevel } from "./policy-level";

@Table
export class Policy extends Model<Policy> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Unique
    @Column
    public Name!: string;
    
    @AllowNull(false)
    @Column
    public Color!: string;
    
    @AllowNull(false)
    @Column
    public Code!: string;
    
    @AllowNull(false)
    @Column
    public Type!: number;

    @AllowNull(false)
    @Column
    public Description!: string;
    
    @AllowNull(false)
    @Column
    public Fine!: string;
    
    @Column
    public CreatedBy!: string;

    @Column
    public UpdatedBy?: string;

    @UpdatedAt
    public UpdatedAt?: Date;

    @CreatedAt
    public CreatedAt!: Date;

    @ForeignKey(() => PolicyLevel)
    @Column
    public PolicyLevelId!: number;
 
    @BelongsTo(() => PolicyLevel, "PolicyLevelId")
    public PolicyLevel!: PolicyLevel;

    @HasMany(() => DangerousCase)
    public DangerousCases?: DangerousCase[];
}
