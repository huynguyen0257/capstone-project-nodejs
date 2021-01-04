import { BelongsTo, Column, ForeignKey, CreatedAt, AllowNull, Model, PrimaryKey, Table, UpdatedAt, Unique, Length, AutoIncrement, Min, Max, DataType } from "sequelize-typescript";
import { STRING } from "sequelize/types";
// import { STRING, UUID, UUIDV4 } from "sequelize";
import { CaseHistoryStatus } from "./case-history-status";
import { DangerousCase } from "./dangerous-case";
import { Room } from "./room";
import { University } from "./university";
import { User } from "./user";


@Table
export class CaseHistory extends Model<CaseHistory> {

    @AutoIncrement
    @PrimaryKey
    @Column
    public Id!: number;

    @AllowNull(false)
    @Column
    public Subject!: string;

    @Column
    public Content?: string;
   
    // @Length({min: 0,max: 20000 })
    @Column({
        type: DataType.TEXT,
    })
    public FileUrls?: string;

    @Column
    public CreatedBy!: string;

    @CreatedAt
    public CreatedAt!: Date;
 
    @ForeignKey(() => CaseHistoryStatus)
    @Column
    public StatusId!: number;
 
    @BelongsTo(() => CaseHistoryStatus, "StatusId")
    public CaseHistoryStatus!: CaseHistoryStatus;
    
    @ForeignKey(() => DangerousCase)
    @Column
    public CaseId!: number;
 
    @BelongsTo(() => DangerousCase, "CaseId")
    public DangerousCase!: DangerousCase;

}
