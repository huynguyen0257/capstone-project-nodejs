import { Model, Repository, Sequelize } from "sequelize-typescript";
import { CountOptions, Includeable, WhereOptions } from "sequelize/types";
import { IRepository } from "./i.repository";

export class BaseRepository<T extends Model> implements IRepository<T> {

    protected readonly repository: Repository<T>;
    
    constructor(
        protected readonly model: new () => T,
        protected readonly sequelize: Sequelize,
    ) {
        this.repository = sequelize.getRepository(model);
    }
    public readonly create = (model: T,models: Array<Repository<Model>>): Promise<T> => {
        return this.repository.create(model,{ include: models});
    }
    public readonly createList = (list_model: Array<T>,models: any): Promise<T[]> => {
        return this.repository.bulkCreate(list_model,models);
    }
    public readonly update = (model: T, id: string | number): Promise<[number, T[]]> => {
        return this.repository.update(model, { where: { Id: id } });
    }
    public readonly remove = (id: string | number): Promise<number> => {
        return this.repository.destroy({ where: { Id: id } });
    }
    public readonly getById = (expression: WhereOptions, models: Array<Repository<Model>>): Promise<T> => {
        return this.repository.findOne({ where: expression, include: models });
    }
    public readonly getAll = (expression: WhereOptions, models: Array<Repository<Model>>, orderBys: any[] = [], limit: any = null,offset: any = null): Promise<T[]> => {
        return this.repository.findAll({ include: models, where: expression, order: orderBys , limit: limit, offset: offset});
    }

    public readonly findByAnotherTableCondition = (expression: WhereOptions, models: Includeable[], orderBys: any[] = [], takeRecords: any = null,skipRecords: any = null): Promise<T[]> => {
        return this.repository.findAll({ include: models, where: expression, order: orderBys , limit: takeRecords, offset: skipRecords});
    }
    public readonly getTotal = (expression: CountOptions): Promise<number> => {
        return this.repository.count(expression);
    }
}