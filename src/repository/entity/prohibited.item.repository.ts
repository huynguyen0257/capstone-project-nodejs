import { Sequelize } from "sequelize-typescript";
import { ProhibitedItem } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IProhibitedItemRepository extends IRepository<ProhibitedItem> {
}

export class ProhibitedItemRepository extends BaseRepository<ProhibitedItem> implements IProhibitedItemRepository {
    constructor(sequelize: Sequelize) {
        super(ProhibitedItem, sequelize);
    }
}
