import { BelongsTo, Column, CreatedAt, ForeignKey, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { Relative } from "./relative";

@Table
export class RelativeFaceImage extends Model<RelativeFaceImage> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public ImageUrl!: string;

    @ForeignKey(() => Relative)
    @Column
    public RelativeId!: number;

    @BelongsTo(() => Relative, "RelativeId")
    public Relative!: number;
    
    @CreatedAt
    public CreatedAt!: Date;

    @Column
    public CreatedBy!: string;
}
