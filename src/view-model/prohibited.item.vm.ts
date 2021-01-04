import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose, plainToClass, Type } from 'class-transformer';

export class ProhibitedItemVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public IsDelete!: boolean;
    constructor() {
        super();
    }
}
export class ProhibitedItemCM extends BaseCM {
    @Expose() public Name!: string;
    constructor() {
        super();
    }
}

export class ProhibitedItemUM extends BaseUM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    constructor() {
        super();
    }
}