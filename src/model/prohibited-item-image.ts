import { BelongsTo, Column, CreatedAt, ForeignKey, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { CaseHistory } from "./case-history";
import { DangerousCase } from "./dangerous-case";
import { ProhibitedItem } from "./prohibited-item";

@Table
export class ProhibitedItemImage extends Model<ProhibitedItemImage> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public ImageUrl!: string;
    
    @Column
    public CreatedBy!: string;

    @CreatedAt
    public CreatedAt!: Date;

    @ForeignKey(() => ProhibitedItem)
    @Column
    public ProhibitedItemId?: number;
 
    @BelongsTo(() => ProhibitedItem, "ProhibitedItemId")
    public ProhibitedItem!: ProhibitedItem;
}
