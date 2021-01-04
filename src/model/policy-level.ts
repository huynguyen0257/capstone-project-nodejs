import { BelongsTo, Column, CreatedAt, ForeignKey, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { CaseHistory } from "./case-history";
import { DangerousCase } from "./dangerous-case";
import { Policy } from "./policy";

@Table
export class PolicyLevel extends Model<PolicyLevel> {

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
    public Level!: number;

    @Column
    public Description!: string;
    
    @Column
    public Color!: string;
    
    @Column
    public CreatedBy!: string;

    @Column
    public UpdatedBy?: string;

    @UpdatedAt
    public UpdatedAt?: Date;

    @CreatedAt
    public CreatedAt!: Date;

    @HasMany(() => Policy)
    public Policies?: Policy[];
}
