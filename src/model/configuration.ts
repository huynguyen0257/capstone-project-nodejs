import { Column, CreatedAt, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, ForeignKey, BelongsTo, AutoIncrement } from "sequelize-typescript";
@Table
export class Configuration extends Model<Configuration> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Unique
    @Column
    public Key!: string;
    
    @AllowNull(false)
    @Column
    public Value!: string;
}
