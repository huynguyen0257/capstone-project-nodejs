import { BelongsTo, Column, ForeignKey, CreatedAt, Default, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { DangerousCase } from "./dangerous-case";
import { User } from "./user";

@Table
export class Notification extends Model<Notification> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public Title!: string;

    @AllowNull(false)
    @Column
    public Body!: string;

    @AllowNull(false)
    @Column
    public ActionClick!: string;

    @AllowNull(false)
    @Column
    public Type!: string;

    @AllowNull(false)
    @Default(false)
    @Column
    public IsRead!: boolean;

    @Column
    public CaseId!: number;

    @ForeignKey(() => User)
    @Column
    public UserId!: number;

    @BelongsTo(() => User, "UserId")
    public User!: User;

    @CreatedAt
    public CreatedAt!: Date;

}
