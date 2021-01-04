import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class ConfigurationVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Key!: string;
    @Expose() public Value!: string;
    constructor() {
        super();
    } 
}
export class ConfigurationCM extends BaseCM {
    @Expose() public Key!: string;
    @Expose() public Value!: any;
    constructor() {
        super();
    }
}
export class ConfigurationUM extends BaseUM {
    @Expose() public Key!: string;
    @Expose() public Value!: any;
    constructor() {
        super();
    }
}