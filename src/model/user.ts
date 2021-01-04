import {
  Column,
  HasOne,
  CreatedAt,
  Default,
  HasMany,
  AllowNull,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  Unique,
  Length,
  AutoIncrement,
  DataType,
} from "sequelize-typescript";
import { UserRole } from "./user-role";
import { Notification } from "./notification";
import { DeviceToken } from "./device-token";
import { UserFaceImage } from "./user-face-image";
import { SecurityMan, Student } from ".";
@Table
export class User extends Model<User> {
  @AutoIncrement
  @PrimaryKey
  @Column
  public Id!: number;

  @AllowNull(false)
  @Unique
  @Column
  public Username!: string;

  @AllowNull(false)
  @Column
  public Password!: string;

  @AllowNull(false)
  @Column
  public FullName!: string;

  @Column
  public Phone?: string;

  @AllowNull(false)
  @Unique
  @Column
  public Email!: string;

  @Column
  public Avatar?: string;

  @Default(true)
  @Column
  public Gender?: boolean;

  @Column
  public BirthDate?: Date;

  @AllowNull(true)
    @Default(0)
    @Column
    public IsRegisterFace!: Number;

  @HasMany(() => UserRole)
  public UserRole!: UserRole[];

  @HasOne(() => Student, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  public Student?: Student;

  @HasOne(() => SecurityMan, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  public SecurityMan?: SecurityMan;

  @Column
  public CreatedBy!: string;

  @Column
  public UpdatedBy?: string;

  @Default(true)
  @Column
  public IsActive!: boolean;

  @UpdatedAt
  public UpdatedAt?: Date;

  @CreatedAt
  public CreatedAt!: Date;

  @HasMany(() => Notification)
  public Notifications?: Notification[];

  @HasMany(() => DeviceToken)
  public DeviceTokens?: DeviceToken[];

  @HasMany(() => UserFaceImage)
  public UserFaceImages?: UserFaceImage[];
}
