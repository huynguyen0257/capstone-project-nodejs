import { Sequelize } from "sequelize-typescript";
import { Notification } from './../../model';
import { IRepository,BaseRepository } from "../generic";


export interface INotificationRepository extends IRepository<Notification> {
}

export class NotificationRepository extends BaseRepository<Notification> implements INotificationRepository {
    constructor(sequelize: Sequelize) {
        super(Notification, sequelize);
    }
}
