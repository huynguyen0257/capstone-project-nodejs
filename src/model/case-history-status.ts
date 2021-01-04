import { BelongsTo, Column, ForeignKey, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { CaseHistoryStatusFamily } from ".";
import { CaseHistory } from "./case-history";

@Table
export class CaseHistoryStatus extends Model<CaseHistoryStatus> {

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
    public Order!: number;
    
    @Column
    public Image!: string;

    @HasMany(() => CaseHistory)
    public CaseHistories?: CaseHistory[];

    @HasMany(() => CaseHistoryStatusFamily)
    public CaseHistoryStatusFamilies?: CaseHistoryStatusFamily[];
}
