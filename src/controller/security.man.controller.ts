import { DeviceToken, SecurityMan, UserRole } from "../model";

import { Request, Response } from "express";
import {
  NotificationService,
  RoleService,
  SecurityManService,
  UserService,
} from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import { SecurityGuardExcelCM, SecurityManVM } from "./../view-model";
import { plainToClass } from "class-transformer";
import { hashSync } from "bcrypt";
import { User, Building } from "../model";
import { Op } from "sequelize";
import { environment } from "../environment";
import { FirebaseService } from "../service";
import { AppUtil } from "../util";

export class SecurityManController {
  private readonly securityManService: SecurityManService;
  private readonly userService: UserService;
  private readonly roleService: RoleService;
  private readonly firebaseService: FirebaseService;
  private readonly notificationService: NotificationService;

  constructor(protected readonly sequelize: Sequelize) {
    this.securityManService = new SecurityManService(sequelize);
    this.userService = new UserService(sequelize);
    this.roleService = new RoleService(sequelize);
    this.firebaseService = new FirebaseService();
    this.notificationService = new NotificationService(sequelize);
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const result = AppUtil.getPageModel(req.query);
      let { Code, Fullname, RoleId, OrderBy, OrderType } = req.query;
      OrderBy = OrderBy ? OrderBy : "IsOnline";
      OrderType = OrderType ? OrderType : "DESC";
      const searchConfig: any = {};
      if (Code) searchConfig["Code"] = { [Op.like]: `%${Code}%` };
      const searchConfigUser: any = {};
      if (Fullname)
        searchConfigUser["Fullname"] = { [Op.like]: `%${Fullname}%` };
      const searchConfigRole: any = {};
      if (RoleId) searchConfigRole["RoleId"] = RoleId;
      let securityMan = await this.securityManService.findByAnotherTableCondition(
        searchConfig,
        [
          {
            model: this.sequelize.getRepository(User),
            where: searchConfigUser,
            include: [
              {
                model: this.sequelize.getRepository(UserRole),
                where: searchConfigRole,
              },
            ],
          },
          this.sequelize.getRepository(Building),
        ],
        [[OrderBy, OrderType]],
        result.info.pageSize,
        result.info.offset
      );
      result.info.total = await this.securityManService.getTotal({
        where: searchConfig,
        include: [
          {
            model: this.sequelize.getRepository(User),
            where: searchConfigUser,
            include: [
              {
                model: this.sequelize.getRepository(UserRole),
                where: searchConfigRole,
              },
            ],
          },
          this.sequelize.getRepository(Building),
        ],
      });
      result.results = securityMan.map((e) => {
        let vm = plainToClass(SecurityManVM, e.User, {
          excludeExtraneousValues: true,
        });
        vm.RoleId = e.User.UserRole[0].RoleId;
        vm.Code = e.Code
        vm.IsOnline = e.IsOnline &&  e.User.IsActive
        vm.IsRegisterFace = e.User.IsRegisterFace
        vm.UserId = e.User.Id
        vm.Id = e.Id
        if (e.Building) {
          vm.BuildingCode = e.Building.Code;
        }
        return vm;
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: "error: " + error.message });
    }
  };

  public getBuildingGuard = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const managerRole = await this.roleService.getById(
        { Name: "Building Guard" },
        []
      );
      let list = await this.securityManService.findByAnotherTableCondition({}, [
        {
          model: this.sequelize.getRepository(User),
          where:{},
          include: [
            {
              model: this.sequelize.getRepository(UserRole),
              where: { RoleId: managerRole.Id },
            },
          ],
        },
        this.sequelize.getRepository(Building),
      ],[['Code','ASC']]);
      let securityManVMs = list.map((e) => {
        let vm = plainToClass(SecurityManVM, e.User, {
          excludeExtraneousValues: true,
        });
        vm.RoleId = managerRole.Id;
        vm.Code = e.Code;
        vm.Id = e.Id;
        if (e.Building) {
          vm.BuildingCode = e.Building.Code;
        }
        return vm;
      });
      return res.status(200).json(securityManVMs);
    } catch (error) {
      return res.status(400).json({ message: "error: " + error.message });
    }
  };

  public createListSecurityGuard = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const securityGuards = req.body.SecurityGuards;
    let valid = true;
    let security_guard_models: any[] = [];
    let roles = await this.roleService.getAll({}, []);
    //Get created Username
    const username = req.headers.extra
      ? JSON.parse(req.headers.extra as string).Username
      : "Unknown";

    //Check Email have been existed in database
    let usernames = await this.userService.getAll(
      { Username: { [Op.or]: securityGuards.map((s: any) => s.Email) } },
      []
    );
    if (usernames.length > 0) {
      let _usernames = usernames.map((u) => u.Username);
      securityGuards.map((s: any) => {
        if (_usernames.includes(s.Email)) {
          s.valid.push({
            title: "Email",
            message: "The email is duplicated in database",
          });
        }
        return s;
      });
      valid = false;
    }

    //For each student
    for (let securityGuard of securityGuards) {
      let data = SecurityGuardExcelCM.generateData<SecurityGuardExcelCM>(
        plainToClass(SecurityGuardExcelCM, securityGuard, {
          excludeExtraneousValues: true,
        }),
        username,
        username
      );
      let role = roles.filter((r) =>
        r.Name.toLowerCase().includes(securityGuard.RoleName.toLowerCase())
      );
      if (role.length === 0) {
        securityGuard.valid.push({
          title: "Role",
          message: "The role is not existed in database",
        });
        valid = false;
      }

      //Create ModelCM instance
      data.SecurityMan = {
        Code: securityGuard.Code,
      };
      data.Username = securityGuard.Email;
      data.Password = hashSync(securityGuard.Email, 10);
      data.Gender = securityGuard.Gender.includes("Nam");
      data.UserRole = [
        {
          RoleId: role[0].Id,
          CreatedBy: username,
          UpdatedBy: username,
        },
      ];
      security_guard_models.push(data);
    }
    if (!valid) {
      return res
        .status(400)
        .json({ message: "invalidate data", data: securityGuards });
    }
    let user: any;
    let tokens = await this.userService
      .getAll({ Username: username }, [
        this.sequelize.getRepository(DeviceToken),
      ])
      .then((users) => {
        user = users[0];
        if (users[0].DeviceTokens) {
          return users[0].DeviceTokens.map((token) => token.Token);
        }
        return [];
      });
    let noti: any = {
      Title: environment.notification.security_guard_importing.data.title,
      Body: environment.notification.security_guard_importing.data.success_body,
      Type: environment.notification.type.success_message,
      UserId: user.Id,
      CaseId: null,
      ActionClick:
        environment.notification.security_guard_importing.web.fcmOption
          .actionLink,
      CreatedBy: username,
    };

    this.userService
      .createList(security_guard_models, {
        returning: true,
        include: [
          { model: this.sequelize.getRepository(UserRole), as: "UserRole" },
          {
            model: this.sequelize.getRepository(SecurityMan),
            as: "SecurityMan",
          },
        ],
      })
      .then(() => {
        //send notification
        this.notificationService.create(noti, tokens);
      })
      .catch((error) => {
        noti.Body = `${environment.notification.security_guard_importing.data.fail_body} ${error.message}`;
        noti.Type = environment.notification.type.fail_message;
        //send notification
        this.notificationService.create(noti, tokens);
      });
    return res.status(200).json({
      message:
        "Create successfully. There are notification when it get done!!!",
    });
  };

  public update = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try{
      let result = await this.securityManService.update(req.body as any, parseInt(req.body.Id as string));
      return res.status(200).json({
        message:
          "Update successfully.",
      });
    }catch(e){
      return res.status(400).json({message: 'update failure'})
    }
  }
}

// vm => repo => service => controller => route => test
