import { BelongsTo, Column, AllowNull, Default, ForeignKey, HasOne, IsUUID, Model, PrimaryKey, Table, UpdatedAt, AutoIncrement } from "sequelize-typescript";
import { Building } from "./building";
import { User } from "./user";

@Table
export class SecurityMan extends Model<SecurityMan> {
    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public Code!: string;

    @AllowNull(true)
    @Default(false)
    @Column
    public IsOnline!: boolean;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column
    public UserId!: number;

    @BelongsTo(() => User, "UserId")
    public User!: User;

    @HasOne(() => Building)
    public Building?: Building;

    
}
