import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class PolicyLevelVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public Level!: number;
    @Expose() public Color!: string;
    constructor() {
        super();
    }
}