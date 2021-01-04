import { Building } from './../model/building';
import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose, plainToClass, Type } from 'class-transformer';
import { UserVM } from ".";
import { User } from "../model";

export class SecurityGuardExcelCM extends BaseCM {
    @Expose() public Code!: string;
    @Expose() public FullName !: string;
    @Expose() public Email!: string;
    @Expose() public Phone?: string;
    @Expose() public Gender?: boolean;
    @Expose() public BirthDate?: Date;
    constructor() {
        super();
    }
}

export class SecurityManVM extends BaseCM {
    @Expose() public Id!: number;
    @Expose() public UserId!: number;
    @Expose() public Code!: string;
    @Expose() public RoleId!: Number;
    @Expose() public RoleName!: string;
    @Expose() public Username!: string;
    @Expose() public FullName!: string;
    @Expose() public Email!: string;
    @Expose() public Phone?: string;
    @Expose() public Avatar?: string;
    @Expose() public Gender?: boolean;
    @Expose() public BirthDate?: Date;
    @Expose() public IsActive!: boolean;
    @Expose() public IsOnline!: boolean;
    @Expose() public BuildingCode!: string;
    @Expose() public IsRegisterFace!: Number;

    constructor() {
        super()
    }
}



