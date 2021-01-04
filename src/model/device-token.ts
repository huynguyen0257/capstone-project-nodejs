import { Column, ForeignKey, Default, HasMany, AllowNull, Model, PrimaryKey, Table, BelongsTo, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { User } from "./user";
@Table
export class DeviceToken extends Model<DeviceToken> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Unique
    @Column
    public Token!: string;
    
    @AllowNull(false)
    @Column
    public DeviceType!: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column
    public UserId!: number;

    @BelongsTo(() => User, "UserId")
    public User!: User;
}
