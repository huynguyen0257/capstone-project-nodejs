import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class DangerousCaseVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public CreatedAt!: Date;
    @Expose() public PolicyLevel!: any;
    @Expose() public PolicyName!: string;
    @Expose() public PolicyColor!: string;
    @Expose() public CaseImage!: string;
    @Expose() public StatusId!: number;
    constructor() {
        super();
    }
}
//Screen => ViewModel => controller => router => test = FE lại
export class DangerousCaseDetailVM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public CreatedAt!: Date;
    @Expose() public CreatedBy!: string;
    @Expose() public LevelName!: string;
    @Expose() public LevelColor!: string;
    @Expose() public Location!: string;
    @Expose() public BuildingId!: number;
    @Expose() public PolicyName!: string;
    @Expose() public PolicyFine!: string;
    @Expose() public PolicyColor!: string;
    @Expose() public ProhibitedItemNames!: string[];
    @Expose() public CaseImages!: any[];
    @Expose() public StatusId!: number;
    @Expose() public CaseHistories!: any;
    @Expose() public Students!: any;
    constructor() {
    }
}
export class StudentDangerousCaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public Code!: string;
    @Expose() public RoomCode?: String;
    @Expose() public UniversityName!: string;
    constructor() {
    }
}

export class CaseHistoryVM {
    @Expose() public Id!: number;
    @Expose() public Subject!: string;
    @Expose() public Content!: string;
    @Expose() public CreatedBy!: string;
    @Expose() public CreatedAt!: Date;
    @Expose() public StatusId!: number;
    @Expose() public StatusName!: string;
    @Expose() public StatusOrder!: number;
    @Expose() public FileUrls!: any[];
    constructor() {
    }
}

export class DangerousCaseCM extends BaseCM {
    @Expose() public Code!: string;
    @Expose() public Description!: string;
    @Expose() public Location!: Date;
    @Expose() public Images!: string[];
    @Expose() public ProhibitedItemNames!: string[];
    @Expose() public StudentUsernames!: string[];
    @Expose() public PolicyId!: number;
    @Expose() public BuildingId!: number;
    @Expose() public IsDangerous!: boolean;
    constructor() {
        super();
    }   
}

export class CaseHistoryCM extends BaseCM {
    @Expose() public Subject!: string;
    @Expose() public Content!: string;
    @Expose() public FileUrls!: any[];
    @Expose() public StatusId!: number;
    @Expose() public CaseId!: number;
    constructor() {
        super();
    }   
}