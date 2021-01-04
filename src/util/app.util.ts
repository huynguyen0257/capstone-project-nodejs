import { RelativeService } from "../service/entity";
import { InfoPagingVM, PagingVM } from "../view-model/paging.vm";
import { Sequelize } from "sequelize-typescript";

export class AppUtil {
    
    public static getPageModel = (data: any): PagingVM => {
        let { current, pageSize } = data;
        current = parseInt(current ? current as string : '1');
        pageSize = parseInt(pageSize ? pageSize as string : '10');
        const result = new PagingVM(current,pageSize);
        delete data.current;
        delete data.pageSize;
        delete data.total;
        // result.info = new InfoPagingVM(current,pageSize);
        return result;
    }
    public static formatDate = (d: Date): string => {
        let month = "" + (d.getMonth() + 1);
        let day = "" + d.getDate();
        let year = d.getFullYear();
    
        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;
    
        return [year, month, day].join("-");
      };
}

// (pagingVm.current - 1) * pagingVm.pageSize