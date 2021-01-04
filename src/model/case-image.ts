import { ProhibitedItem } from './prohibited-item';
import { Column, ForeignKey,Default, HasMany, AllowNull, Model, PrimaryKey, Table, BelongsTo, Unique, Length, AutoIncrement, DataType } from "sequelize-typescript";
import { UserRole } from "./user-role";
import {Notification} from "./notification"
import { User } from "./user";
import { DangerousCase } from "./dangerous-case";
@Table
export class CaseImage extends Model<CaseImage> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT,
    })
    public ImageUrl!: string;
    
    @Column({
        type: DataType.TEXT,
    })
    public FaceData!: string;
    
    @Column({
        type: DataType.TEXT,
    })
    public BodyData!: string;
    
    @Column({
        type: DataType.TEXT,
    })
    public ProhibitedItemData!: string;

    @ForeignKey(() => DangerousCase)
    @Column
    public CaseId!: number;

    @BelongsTo(() => User, "CaseId")
    public DangerousCase!: DangerousCase;
}
