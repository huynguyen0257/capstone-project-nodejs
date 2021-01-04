import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class NotificationVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Title!: string;
    @Expose() public Body!: string;
    @Expose() public Type!: number;
    @Expose() public IsRead!: boolean;
    @Expose() public CaseId!: string;
    @Expose() public CreatedAt!: Date;
    @Expose() public URL!: String;

    constructor() {
        super();
    }
}