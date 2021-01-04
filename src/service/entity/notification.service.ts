import { Sequelize } from "sequelize-typescript";
import { Notification } from "./../../model";
import { BaseService,IService } from '../generic';
import { FirebaseService } from "../fire-base.service";
import console from "console";

export interface INotificationService extends IService<Notification> {
}

export class NotificationService extends BaseService<Notification> implements INotificationService {
    private readonly firebaseService: FirebaseService;
    constructor(sequelize: Sequelize) {
        super(Notification, sequelize);
        this.firebaseService = new FirebaseService();
    }

    public readonly create = (data: any, tokens: any): Promise<Notification> => {
        var result = this.repository.create(data, []);
        if (tokens.length > 0) {
            this.firebaseService.sendNotification(tokens, data.Title, data.Body,data.Type.toString(), data.ActionClick, data.CreatedBy);
        }
        return result;
    }
}
