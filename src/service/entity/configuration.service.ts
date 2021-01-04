import { Sequelize } from "sequelize-typescript";
import { Configuration } from "./../../model";
import { BaseService,IService } from '../generic';

export interface IConfigurationService extends IService<Configuration> {
}

export class ConfigurationService extends BaseService<Configuration> implements IConfigurationService {
    constructor(sequelize: Sequelize) {
        super(Configuration, sequelize);
    }
}
