import { Expose } from "class-transformer";
import { BaseVM } from "./base.vm";

export class PagingVM {
    public results!: any[];
    public info!: InfoPagingVM;
    constructor(current: number, pageSize: number) {
        this.info = new InfoPagingVM(current,pageSize);
        this.results = [];
    }
}
export class InfoPagingVM {
    constructor(current: number, pageSize: number) {
            this.current =current,
            this.pageSize = pageSize,
            this.offset = (current - 1 ) * pageSize
    }
    public current!: number;
    public pageSize!: number;
    public offset!: number;
    public total?: number;
}