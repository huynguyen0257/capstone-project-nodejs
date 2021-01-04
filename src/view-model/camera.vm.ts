import { BaseVM, BaseCM, BaseUM } from "./base.vm";
import { Expose } from 'class-transformer';

export class CameraVM extends BaseVM {
    @Expose() public Id!: number;
    @Expose() public Code!: string;
    @Expose() public Position!: string;
    @Expose() public RtspLink!: string;
    @Expose() public Username!: string;
    @Expose() public Password!: string;
    @Expose() public BuildingCode!: string;
    @Expose() public Type!: number;
    @Expose() public Status!: number;
    @Expose() public BuildingId!: number;
    @Expose() public Image?: String;
    @Expose() public SocketId!: String;
    @Expose() public IsOn!: boolean;
    constructor() {
        super();
    }
}

export class CameraCM extends BaseCM {
    @Expose() public Code!: string;
    @Expose() public Position!: string;
    @Expose() public RtspLink!: string;
    @Expose() public Username!: string;
    @Expose() public Password!: string;
    @Expose() public Type!: number;
    @Expose() public BuildingId!: number;
    @Expose() public SocketId!: String;
    @Expose() public IsOn!: boolean;
    constructor() {
        super();
    }
}

export class CameraUM extends BaseUM {
    @Expose() public Code!: string;
    @Expose() public Position!: string;
    @Expose() public RtspLink!: string;
    @Expose() public Username!: string;
    @Expose() public Password!: string;
    @Expose() public Type!: number;
    @Expose() public BuildingId!: number;
    @Expose() public SocketId!: String;
    @Expose() public IsOn!: boolean;
    constructor() {
        super();
    }
}