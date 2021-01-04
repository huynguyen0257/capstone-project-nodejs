import { Sequelize } from "sequelize-typescript";
import { Configuration } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface IConfigurationRepository extends IRepository<Configuration> {
}

export class ConfigurationRepository extends BaseRepository<Configuration> implements IConfigurationRepository {
    constructor(sequelize: Sequelize) {
        super(Configuration, sequelize);
    }
}
