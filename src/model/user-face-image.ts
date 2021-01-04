import { BelongsTo, Column, CreatedAt, ForeignKey, HasMany, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement } from "sequelize-typescript";
import { User } from "./user";

@Table
export class UserFaceImage extends Model<UserFaceImage> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public ImageUrl!: string;

    @ForeignKey(() => User)
    @Column
    public UserId!: number;

    @BelongsTo(() => User, "UserId")
    public User!: number;
    
    @CreatedAt
    public CreatedAt!: Date;

    @Column
    public CreatedBy!: string;
}
