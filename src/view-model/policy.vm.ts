import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class PolicyVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public Color!: string;
    @Expose() public Code!: string;
    @Expose() public Type!: number;
    @Expose() public Description!: string;
    @Expose() public Fine!: string;
    @Expose() public UpdatedAt!: Date;
    @Expose() public CreatedAt!: Date;
    constructor() {
        super();
    }
}