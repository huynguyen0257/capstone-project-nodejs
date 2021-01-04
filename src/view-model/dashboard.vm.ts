import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';
export class DangerousCaseGroupByPolicyVM extends BaseVM {
    @Expose() public PolicyId!: Number;
    @Expose() public PolicyName!: String;
    @Expose() public NumberOfCase!: number;
    constructor() {
        super();
    }   
}
export class NumberOfDangerousCaseByMonthVM extends BaseVM {
    @Expose() public Month!: String;
    @Expose() public NumberOfCase!: number;
    @Expose() public NumberOfStrangerCase?: number;
    @Expose() public NumberOfItemCase?: number;
    constructor() {
        super();
    }   
}
export class NumberOfStudentGroupByBuildingVM extends BaseVM {
    @Expose() public BuildingId!: Number;
    @Expose() public BuildingCode!: String;
    @Expose() public NumberOfStudent!: number;
    constructor() {
        super();
    }   
}
export class NumberOfCaseGroupByBuildingVM extends BaseVM {
    @Expose() public BuildingId!: Number;
    @Expose() public BuildingCode!: String;
    @Expose() public NumberOfCase!: number;
    constructor() {
        super();
    }   
}
export class NumberOfStudentGroupByUniversityVM extends BaseVM {
    @Expose() public UniversityId!: Number;
    @Expose() public UniversityName!: String;
    @Expose() public NumberOfStudent!: number;
    constructor() {
        super();
    }   
}