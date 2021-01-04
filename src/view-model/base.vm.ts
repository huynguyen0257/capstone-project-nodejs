import { mapping, map, select } from 'auto-mapping';
import { FORMERR } from 'dns';

export class BaseCM {
    public static readonly generateData = <T>(data: T, UpdatedBy: string, CreatedBy: string): any => {
        return { ...data, UpdatedBy, CreatedBy };
    }
}

export class BaseUM {
    public static readonly generateData = <T>(data: T, UpdatedBy: string): any => {
        return { ...data, UpdatedBy };
    }
}

export class BaseVM {
    public static readonly generateData = <T>(data: T): any => {
        return { ...data };
    }
}

// export class AdaptVM {
//     public static readonly adaptData = (source: any, destination: any) => {
//         let keys : string[]= [];
//         for (let key in source) {
//             keys.push(key);
//         }
//         for (let key in destination.dataValues) {
//             if(keys.indexOf(key) != -1){
//                 destination.dataValues[key] = source[key];
//             }
//         }

//     }
// }

