import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class RoomVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public BuildingId!: number;
    constructor() {
        super();
    }
}