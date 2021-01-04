import { BelongsTo, Column, CreatedAt, Default, ForeignKey, HasMany, IsUUID, Model, PrimaryKey, Table, UpdatedAt, AutoIncrement } from "sequelize-typescript";
import { UserRole } from "./user-role";

@Table
export class Role extends Model<Role> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @Column
    public Name!: string;

    @HasMany(() => UserRole)
    public UserRole?: UserRole[];

    @Column
    public CreatedBy!: string;

    @Column
    public UpdatedBy!: string;

    @Default(false)
    @Column
    public IsDelete!: boolean;

    @UpdatedAt
    public UpdatedAt!: Date;

    @CreatedAt
    public CreatedAt!: Date;
}
