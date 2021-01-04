import { BelongsTo, Column, CreatedAt, Default, ForeignKey, HasMany, IsUUID, Model, PrimaryKey, Table, UpdatedAt, AutoIncrement, AllowNull } from "sequelize-typescript";
import { Role } from "./role";
import { User } from "./user";

@Table
export class UserRole extends Model<UserRole> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column
    public UserId!: number;

    @AllowNull(false)
    @ForeignKey(() => Role)
    @Column
    public RoleId!: number;

    @BelongsTo(() => User, "UserId")
    public User!: User;

    @BelongsTo(() => Role, "RoleId")
    public Role!: Role;
}
