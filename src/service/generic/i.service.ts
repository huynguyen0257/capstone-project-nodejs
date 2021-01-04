import { Model, Repository } from "sequelize-typescript";
import { Includeable, WhereOptions } from "sequelize/types";

export interface IService<T extends Model> {
    getAll: (expression: WhereOptions, models: Array<Repository<Model>>) => Promise<T[]>;
    findByAnotherTableCondition: (expression: WhereOptions, models: Includeable[]) => Promise<T[]>;
    getById: (expression: WhereOptions, models: Array<Repository<Model>>) => Promise<T>;
    create: (model: T,models: Array<Repository<Model>>) => Promise<T>;
    update: (model: T, id: string | number) => Promise<[number, T[]]>;
    remove: (id: string | number) => Promise<number>;
}