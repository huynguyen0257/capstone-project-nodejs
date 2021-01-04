import { BelongsTo, Column, CreatedAt, ForeignKey, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { CaseHistory } from "./case-history";
import { DangerousCase } from "./dangerous-case";
import { ProhibitedItem } from "./prohibited-item";

@Table
export class ProhibitedItemCase extends Model<ProhibitedItemCase> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @ForeignKey(() => DangerousCase)
    @Column
    public CaseId!: number;
 
    @BelongsTo(() => DangerousCase, "CaseId")
    public DangerousCase!: DangerousCase;

    @ForeignKey(() => ProhibitedItem)
    @Column
    public ItemId!: number;
 
    @BelongsTo(() => ProhibitedItem, "ItemId")
    public ProhibitedItem!: ProhibitedItem;

}
