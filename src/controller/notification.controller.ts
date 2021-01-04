import { Request, Response } from "express";
import {
  NotificationService,
  AuthService,
  RoleService,
  UserService,
} from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import { NotificationVM } from "./../view-model";
import { hashSync } from "bcrypt";
import { plainToClass } from "class-transformer";
import { FirebaseService } from "../service";
import { Op } from "sequelize";
import { Notification } from "../model";
import { environment } from "../environment";

export class NotificationController {
  private readonly notificationService: NotificationService;
  private readonly userService: UserService;
  constructor(protected readonly sequelize: Sequelize) {
    this.notificationService = new NotificationService(sequelize);
    this.userService = new UserService(sequelize);
  }

  public getByUserId = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    if (req.params.userId === undefined) {
      return res.status(400).json({ message: "Error " + "Invalid user id" });
    }
    return await this.notificationService.getAll(
      { userId: req.params.userId },
      [],
      [['CreatedAt', 'DESC']]
    )
      .then((list) => {
        const result = list.map((model) =>{
          let vm = plainToClass(NotificationVM, model, { excludeExtraneousValues: true })
          vm.URL = model.ActionClick;
          // if(model.CaseId) {
          //   vm.URL = `${environment.notification.fe_link}${model.CaseId}`
          // }
          return vm
        }
        );
        return res.status(200).json(result);
      })
      .catch((err) =>
        res.status(400).json({ message: "Error " + err.message })
      );
  }

  public updateRead = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    if (req.params.id === undefined) {
      return res.status(400).json({ message: "Error " + "Invalid notification id" })
    }
    const notification = await this.notificationService.getById({Id: req.params.id},[])
    if(!notification) return res.status(404).json({ message: "Error " + "invalid notification id" })

    var result = await this.notificationService.update( { IsRead: true} as any, req.params.id)
    return res.status(200).json({notification})
  }

  public markAllRead = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    console.log("Hello")
    var user = await this.userService.getById({ Id: req.params.userId }, []);
    if (!user) {
      res.status(404).json({ message: "Id not found :" + req.params.userId });
    }
    try {
      (await this.notificationService.getAll({UserId: user.Id},[])).map(notification => notification.update({IsRead : true}));
      return res.status(200).json({message: "Updated successfully"});
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
