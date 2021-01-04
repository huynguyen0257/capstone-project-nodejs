import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose, plainToClass } from 'class-transformer';

export class UserCM extends BaseCM {
    @Expose() public Username!: string;
    @Expose() public FullName!: string;
    @Expose() public Password!: string;
    @Expose() public Code!: string;
    @Expose() public Email!: string;
    @Expose() public Phone?: string;
    @Expose() public Gender?: boolean;
    @Expose() public BirthDate?: Date;
    @Expose() public RoleId!: number;
    @Expose() public RoomId!: number;
    @Expose() public UniversityId?: any;
    constructor() {
        super(); 
    }
}

export class RegisterCM extends BaseCM {
    @Expose() public Username!: string;
    @Expose() public FullName!: string;
    @Expose() public Password!: string;
    @Expose() public Email!: string;
    constructor() {
        super();
    }
}

export class UserUM extends BaseUM {
    @Expose() public Id!: string;
    // @Expose() public Username!: string;
    @Expose() public FullName!: string;
    @Expose() public Email!: string;
    @Expose() public Phone?: string;
    @Expose() public Gender?: boolean;
    @Expose() public BirthDate?: Date;
    @Expose() public RoomId?: Date;
    @Expose() public DayOut?: Date;
    @Expose() public UniversityId?: Number;
    constructor() {
        super();
    }
}

export class UserVM extends BaseVM {
    @Expose() public Id!: string;
    @Expose() public Username!: string;
    @Expose() public FullName!: string;
    @Expose() public Email!: string;
    @Expose() public Code!: String;
    @Expose() public RoleId!: Number;
    @Expose() public RoleName!: String;
    @Expose() public UniversityId?: Number; 
    @Expose() public RoomId?: Number; 
    @Expose() public RoomCode?: String; 
    @Expose() public BuildingId?: Number; 
    @Expose() public Phone?: string;
    @Expose() public Avatar?: string;
    @Expose() public Gender?: boolean;
    @Expose() public BirthDate?: Date;
    @Expose() public IsActive!: boolean;
    constructor() {
        super();
    }
}