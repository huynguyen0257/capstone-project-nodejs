import { Model, Repository } from "sequelize-typescript";
import { CountOptions, Includeable, WhereOptions } from "sequelize/types";

export interface IRepository<T extends Model> {
getAll: (expression: WhereOptions, models: Array<Repository<Model>>, orderBys?: any[],limit?: any,offset?: any) => Promise<T[]>;
    findByAnotherTableCondition: (expression: WhereOptions, models:  Includeable[], orderBys?: any[],takeRecords?: any,skipRecords?: any) => Promise<T[]>;
    getById: (expression: WhereOptions, models: Array<Repository<Model>>) => Promise<T>;
    create: (model: T,models: Array<Repository<Model>>) => Promise<T>;
    createList: (list_model: Array<T>,models: Array<Repository<Model>>) => Promise<T[]>;
    update: (model: T, id: string | number) => Promise<[number, T[]]>;
    remove: (id: string | number) => Promise<number>;
    getTotal: (expression: CountOptions) => Promise<number>;
}
