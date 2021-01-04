import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose, plainToClass } from 'class-transformer';

export class UniversityVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    constructor() {
        super();
    }
}

export class UniversityCM extends BaseCM {
    @Expose() public Name!: string;
    constructor() {
        super();
    }
}
export class UniversityUM extends BaseUM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public IsDelete!: boolean;

    constructor() {
        super();
    }
}
