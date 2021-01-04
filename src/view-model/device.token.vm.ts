import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class DeviceTokenVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Token!: string;
    @Expose() public DeviceType!: string;
    @Expose() public UserId!: number;
    constructor() {
        super();
    }
}

export class DeviceTokenCM extends BaseCM {
    @Expose() public Token!: string;
    @Expose() public DeviceType!: string;
    constructor() {
        super();
    }
}
export class DeviceTokenUM extends BaseUM {
    @Expose() public Id!: number;
    @Expose() public DeviceType!: string;
    @Expose() public Token!: string;
    constructor() {
        super();
    }
}