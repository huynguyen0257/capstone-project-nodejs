import { Sequelize } from "sequelize-typescript";
import { ProhibitedItem } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IProhibitedItemService extends IService<ProhibitedItem> {
}

export class ProhibitedItemService extends BaseService<ProhibitedItem> implements IProhibitedItemService {
    constructor(sequelize: Sequelize) {
        super(ProhibitedItem, sequelize);
    }
}

