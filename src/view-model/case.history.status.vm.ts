import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class CaseHistoryStatusVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public Image!: string;
    @Expose() public Order!: number;
    @Expose() public ParentId!: any;
    constructor() {
        super();
    }
}
export class CaseHistoryStatusCM extends BaseCM {
    @Expose() public Name!: string;
    @Expose() public Image!: string;
    @Expose() public Order!: number;
    constructor() {
        super();
    }   
}
export class CaseHistoryStatusUM extends BaseUM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public Image!: string;
    @Expose() public Order!: number;
    constructor() {
        super();
    }   
}