import { BelongsTo, Column, ForeignKey, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { CaseHistoryStatus } from ".";

@Table
export class CaseHistoryStatusFamily extends Model<CaseHistoryStatusFamily> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @ForeignKey(() => CaseHistoryStatus)
    @Column
    public CaseHistoryStatusId!: number;
 
    @BelongsTo(() => CaseHistoryStatus, "CaseHistoryStatusId")
    public CaseHistoryStatus!: CaseHistoryStatus;
    
    @Column
    public ParentId!: number;
}
