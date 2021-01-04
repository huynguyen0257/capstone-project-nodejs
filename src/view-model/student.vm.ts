import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose, plainToClass, Type } from "class-transformer";
import { UserVM } from ".";
import { User } from "../model";

export class StudentVM extends BaseVM {
  @Expose() public Id!: number;
  @Expose() public UserId!: number;
  @Expose() public Code!: string;
  @Expose() public Username!: string;
  @Expose() public FullName !: string;
  @Expose() public Email!: string;
  @Expose() public Phone?: string;
  @Expose() public Avatar?: string;
  @Expose() public Gender?: boolean;
  @Expose() public BirthDate?: Date;
  @Expose() public IsActive!: boolean;
  @Expose() public RoomCode?: String;
  @Expose() public RoomId!: number;
  @Expose() public IsRegisterFace!: Number;
  @Expose() public DayIn!: Date; 
  @Expose() public DayOut!: Date;
  @Expose() public UniversityId?: Number;
  constructor() {
    super();
  }
}

export class StudentExcelCM extends BaseCM {
  @Expose() public Code!: string;
  @Expose() public FullName !: string;
  @Expose() public Email!: string;
  @Expose() public Phone?: string;
  @Expose() public Gender?: boolean;
  @Expose() public BirthDate?: Date;
  @Expose() public RoomCode?: String;
  @Expose() public RoomId!: number;
  @Expose() public DayIn!: Date; 
  @Expose() public DayOut!: Date;
  @Expose() public UniversityId!: number;
  constructor() {
    super();
  }
}
export class StudentRegisterCM extends BaseCM {
  @Expose() public Id!: number;
  @Expose() public RoomId!: number;
  @Expose() public DayIn!: Date;
  @Expose() public DayOut!: Date;

  constructor() {
    super();
  }
}


