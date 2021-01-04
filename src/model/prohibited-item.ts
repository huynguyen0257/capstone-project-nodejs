import { Column, Default, CreatedAt, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { ProhibitedItemCase } from "./prohibited-item-case";
import { ProhibitedItemImage } from "./prohibited-item-image";

@Table
export class ProhibitedItem extends Model<ProhibitedItem> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Unique
    @Column
    public Name!: string;
    
    @AllowNull(false)
    @Default(false)
    @Column
    public IsDelete!: boolean;

    @Column
    public CreatedBy!: string;

    @Column
    public UpdatedBy?: string;

    @UpdatedAt
    public UpdatedAt?: Date;

    @CreatedAt
    public CreatedAt!: Date;

    @HasMany(() => ProhibitedItemCase)
    public ProhibitedItemCases?: ProhibitedItemCase[];
    
    @HasMany(() => ProhibitedItemImage)
    public Images?: ProhibitedItemImage[];
}
