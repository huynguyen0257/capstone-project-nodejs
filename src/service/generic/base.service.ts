import { CountOptions, Includeable, WhereOptions } from "sequelize/types";
import { Repository, Model, Sequelize } from "sequelize-typescript";
import { IService } from ".";
import { IRepository, BaseRepository } from "./../../repository/generic";

export class BaseService<T extends Model> implements IService<T> {

    protected readonly repository: IRepository<T>;
    constructor(
        protected readonly model: new () => T,
        protected readonly sequelize: Sequelize,
    ) {
        this.repository = new BaseRepository<T>(model, sequelize);
    }
    public readonly getById = (expression: WhereOptions, models: Array<Repository<Model>>): Promise<T> => {
        return this.repository.getById(expression, models);
    }
    public readonly getAll = (expression: WhereOptions, models: Array<Repository<Model>>, orderBys: any[] = [], limit: any = null, offset: any = null): Promise<T[]> => {
        return this.repository.getAll(expression, models, orderBys, limit, offset);
    }

    public readonly findByAnotherTableCondition = (expression: WhereOptions, models:Includeable[], orderBys: any[] = [], takeRecords: any = null, skipRecords: any = null): Promise<T[]> => {
        return this.repository.findByAnotherTableCondition(expression, models, orderBys, takeRecords, skipRecords);
    }

    public readonly create = (model: T, models: Array<Repository<Model>>): Promise<T> => {
        return this.repository.create(model, models);
    }
    public readonly createList = (list_model: Array<T>, models: any): Promise<T[]> => {
        return this.repository.createList(list_model, models);
    }
    /**
   * Return the number of the AFFECTED ROW | 1 is oke, 0 is not oke
   */
    public readonly update = (model: T, id: string | number): Promise<[number, T[]]> => {
        return this.repository.update(model, id);
    }
    public readonly remove = (id: string | number): Promise<number> => {
        return this.repository.remove(id);
    }
    public readonly getTotal = (expression: CountOptions): Promise<number> => {
        return this.repository.getTotal(expression);
    }
}
