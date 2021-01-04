import { BaseVM } from "./base.vm";
import { Expose } from 'class-transformer';

export class RoleVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    constructor() {
        super();
    }
}