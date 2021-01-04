import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class RelativeVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Name!: string;
    @Expose() public Age!: number;
    @Expose() public Gender!: boolean;
    @Expose() public Avatar!: string;
    @Expose() public IdentityCardNumber!: string;
    @Expose() public FrontIdentityCardImage!: string;
    @Expose() public BackIdentityCardImage!: string;
    @Expose() public IsCheckout!: boolean;
    @Expose() public TimeIn!: Date;
    @Expose() public TimeOut!: Date;
    @Expose() public StudentId!: number;
    @Expose() public StudentRoom!: string;
    @Expose() public StudentName!: string;
    @Expose() public StudentCode!: string;
    constructor() {
        super();
    }
}
export class RelativeCM extends BaseCM {
    @Expose() public Name!: string;
    @Expose() public Age!: number;
    @Expose() public Gender!: boolean;
    @Expose() public IdentityCardNumber!: string;
    @Expose() public FrontIdentityCardImage!: string;
    @Expose() public BackIdentityCardImage!: string;
    @Expose() public IsCheckout!: boolean;
    @Expose() public TimeIn!: Date;
    @Expose() public StudentId!: number;
    constructor() {
        super();
    }
}
export class RelativeUM extends BaseUM{
    @Expose() public Id!: number;
    @Expose() public IsCheckout!: boolean;
    @Expose() public StudentId!: number;

    constructor() {
        super();
    }
}