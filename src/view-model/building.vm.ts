import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class BuildingVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public Location!: string;
    @Expose() public Longitude!: string;
    @Expose() public Latitude!: string;
    @Expose() public ImageUrl!: string;
    @Expose() public NumberOfFloor!: number;
    @Expose() public NumberOfRoom!: number;
    @Expose() public NumberOfStudent!: number;
    @Expose() public ManagerName!: string;
    @Expose() public ManagerId!: number;
    @Expose() public Rooms!: any;
    @Expose() public RoomGroupBy!: any;
    constructor() {
        super();
    }
}
export class RoomVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public Floor!: number;
    @Expose() public NumberOfStudent!: number;
    @Expose() public CurrentStudent!: number;
    @Expose() public BuildingId!: number;
    @Expose() public BuildingCode!: string;
    @Expose() public Gender!: boolean;
    constructor() {
        super();
    }
}


export class RoomDetailVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public Floor!: number;
    @Expose() public BuildingId!: number;
    @Expose() public BuildingCode!: string;
    @Expose() public NumberOfStudent!: number;
    @Expose() public CurrentStudent!: number;
    @Expose() public Students!: any[];
    constructor() {
        super();
    }
}
export class BuildingCM extends BaseCM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public Location!: string;
    @Expose() public Longitude!: string;
    @Expose() public Latitude!: string;
    @Expose() public NumberOfFloor!: number;
    @Expose() public NumberOfRoom!: number;
    @Expose() public NumberOfStudent!: number;
    constructor() {
        super();
    }
}
export class BuildingUM extends BaseUM {
    @Expose() public Id!: number;
    @Expose() public ManagerId!: number;

    constructor() {
        super();
    }
}