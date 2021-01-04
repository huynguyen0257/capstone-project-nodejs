import { Policy } from "./../../model/policy";
import { Model, Repository, Sequelize } from "sequelize-typescript";
import {
  Building,
  Camera,
  CaseHistory,
  CaseHistoryStatus,
  CaseImage,
  DangerousCase,
  DeviceToken,
  Notification,
  ProhibitedItem,
  ProhibitedItemCase,
  Relative,
  Role,
  SecurityMan,
  Student,
  StudentCase,
  User,
  UserRole,
} from "./../../model";
import { BaseService, IService } from "../generic";
import { BaseRepository, IRepository } from "../../repository/generic";
import { WhereOptions } from "sequelize/types";
import { environment } from "../../environment";
import { NotificationService } from "./notification.service";
import { FirebaseService } from "../fire-base.service";
import { Op } from "sequelize";
import { CameraRepository } from "../../repository/entity/camera.repository";

export interface IDangerousCaseService extends IService<DangerousCase> { }

export class DangerousCaseService
  extends BaseService<DangerousCase>
  implements IDangerousCaseService {
  protected readonly roleRepo: IRepository<Role>;
  protected readonly userRepo: IRepository<User>;
  protected readonly prohibitedItemRepo: IRepository<ProhibitedItem>;
  protected readonly studentRepo: IRepository<Student>;
  protected readonly deviceTokenRepo: IRepository<DeviceToken>;
  protected readonly buildingRepo: IRepository<Building>;
  protected readonly cameraRepo: IRepository<Camera>;
  protected readonly relativeRepo: IRepository<Relative>;
  private readonly firebaseService: FirebaseService;
  private readonly notificationService: NotificationService;
  // protected readonly caseHistoryRepository: IRepository<CaseHistory>;
  protected readonly caseHistoryStatusRepository: IRepository<
    CaseHistoryStatus
  >;
  protected readonly caseImageRepository: IRepository<CaseImage>;
  // protected readonly caseHistoryStatusRepository: IRepository<CaseHistory>;
  constructor(sequelize: Sequelize) {
    super(DangerousCase, sequelize);
    this.roleRepo = new BaseRepository<Role>(Role, sequelize);
    this.userRepo = new BaseRepository<User>(User, sequelize);
    this.prohibitedItemRepo = new BaseRepository<ProhibitedItem>(
      ProhibitedItem,
      sequelize
    );
    this.studentRepo = new BaseRepository<Student>(Student, sequelize);
    this.deviceTokenRepo = new BaseRepository<DeviceToken>(
      DeviceToken,
      sequelize
    );
    this.buildingRepo = new BaseRepository<Building>(Building, sequelize);
    this.cameraRepo = new BaseRepository<Camera>(Camera, sequelize);
    this.relativeRepo = new BaseRepository<Relative>(Relative, sequelize);
    this.firebaseService = new FirebaseService();
    this.notificationService = new NotificationService(sequelize);
    // this.caseHistoryRepository = new BaseRepository<CaseHistory>(CaseHistory, sequelize);
    this.caseHistoryStatusRepository = new BaseRepository<CaseHistoryStatus>(
      CaseHistoryStatus,
      sequelize
    );
    this.caseImageRepository = new BaseRepository<CaseImage>(
      CaseImage,
      sequelize
    );
  }

  public readonly sendNotiCaseToManager = async (
    modelCase: DangerousCase,
    isDangerous: boolean,
    body: string
  ): Promise<number[]> => {
    var role = await this.roleRepo.findByAnotherTableCondition(
      { Name: "Manager" },
      [this.sequelize.getRepository(UserRole)]
    );
    var userIds: number[] = [];
    var sendIds: number[] = [];
    if (role[0].UserRole) {
      role[0].UserRole.map((userRole) => {
        userIds.push(userRole.UserId);
      });
    }
    // var tokens: string[] = [];

    for (let id of userIds) {
      //create notification
      var noti: any = {
        Title: `${modelCase.Policy.Name}`,
        Body: `${modelCase.Location}`,
        Type: isDangerous
          ? environment.notification.type.dangerous_case_message
          : environment.notification.type.warining_case_message,
        UserId: id,
        CaseId: modelCase.Id ? modelCase.Id : null,
        ActionClick: `${environment.notification.dangerous_case.web.fcmOption.actionLink}/${modelCase.Id}`,
        CreatedBy: modelCase.Code,
      };

      var tokens = await this.deviceTokenRepo.findByAnotherTableCondition(
        { UserId: id },
        [
          {
            model: this.sequelize.getRepository(User),
            include: [this.sequelize.getRepository(SecurityMan)],
          },
        ]
      );
      let sendToken = tokens.filter(e => e.User.SecurityMan && e.User.SecurityMan.IsOnline).map(e => e.Token)
      await this.notificationService
        .create(
          noti,
          sendToken
        )
        .then((_) => {
          sendIds.push(id);
        });
    }
    return sendIds;
  };

  public readonly sendNotiCaseToUsers = async (
    modelCase: any,
    isDangerous: boolean,
    body: string,
    userIds: number[]
  ): Promise<number[]> => {
    var sendIds: number[] = [];

    for (let id of userIds) {
      //create notification
      var noti: any = {
        Title: `[${modelCase.Code}] ${environment.notification.dangerous_case.data.student_in_case_title}`,
        Body: `${body}`,
        Type: isDangerous
          ? environment.notification.type.dangerous_case_message
          : environment.notification.type.warining_case_message,
        UserId: id,
        CaseId: modelCase.Id ? modelCase.Id : null,
        ActionClick: `${environment.notification.dangerous_case.web.fcmOption.actionLink}/${modelCase.Id}`,
        CreatedBy: modelCase.Code,
      };

      var tokens = await this.deviceTokenRepo.getAll({ UserId: id }, []);
      await this.notificationService
        .create(
          noti,
          tokens.map((e) => e.Token)
        )
        .then((_) => {
          sendIds.push(id);
        });
    }
    return sendIds;
  };

  public readonly sendNotiCaseUpdatedToUsers = async (
    modelCase: any,
    userIds: number[]
  ): Promise<number[]> => {
    var sendIds: number[] = [];

    for (let id of userIds) {
      //create notification
      var noti: any = {
        Title: `[${modelCase.Code}] ${environment.notification.dangerous_case_step_student.data.title}`,
        Body: `${environment.notification.dangerous_case_step_student.data.body}`,
        Type: environment.notification.type.success_message,
        UserId: id,
        CaseId: modelCase.Id ? modelCase.Id : null,
        ActionClick: `${environment.notification.dangerous_case.web.fcmOption.actionLink}/${modelCase.Id}`,
        CreatedBy: modelCase.Code,
      };

      var tokens = await this.deviceTokenRepo.getAll({ UserId: id }, []);
      await this.notificationService
        .create(
          noti,
          tokens.map((e) => e.Token)
        )
        .then((_) => {
          sendIds.push(id);
        });
    }
    return sendIds;
  };

  public readonly sendNotiCaseToBuildingGuard = async (
    modelCase: any,
    isDangerous: boolean,
    body: string,
    userIds: number[]
  ): Promise<number[]> => {
    var sendIds: number[] = [];

    for (let id of userIds) {
      //create notification
      var noti: any = {
        Title: `${modelCase.Policy.Name}, `,
        Body: `${modelCase.Location}`,
        Type: isDangerous
          ? environment.notification.type.dangerous_case_message
          : environment.notification.type.warining_case_message,
        UserId: id,
        CaseId: modelCase.Id ? modelCase.Id : null,
        ActionClick: `${environment.notification.dangerous_case.web.fcmOption.actionLink}/${modelCase.Id}`,
        CreatedBy: modelCase.Code,
      };

      var tokens = await this.deviceTokenRepo.getAll({ UserId: id }, []);
      await this.notificationService
        .create(
          noti,
          tokens.map((e) => e.Token)
        )
        .then((_) => {
          sendIds.push(id);
        });
    }
    return sendIds;
  };

  public readonly sendNotiCaseToAreaGuard = async (
    modelCase: any,
    isDangerous: boolean,
    body: string
  ): Promise<number[]> => {
    var role = await this.roleRepo.getAll({ Name: "Area Guard" }, [
      this.sequelize.getRepository(UserRole),
    ]);
    var userIds: number[] = [];
    var sendIds: number[] = [];
    if (role[0].UserRole) {
      role[0].UserRole.map((userRole) => {
        userIds.push(userRole.UserId);
      });
    }
    // var tokens: string[] = [];

    for (let id of userIds) {
      //create notification
      var noti: any = {
        Title: `${modelCase.Policy.Name}, `,
        Body: `${modelCase.Location}`,
        Type: isDangerous
          ? environment.notification.type.dangerous_case_message
          : environment.notification.type.warining_case_message,
        UserId: id,
        CaseId: modelCase.Id ? modelCase.Id : null,
        ActionClick: `${environment.notification.dangerous_case.web.fcmOption.actionLink}/${modelCase.Id}`,
        CreatedBy: modelCase.Code,
      };

      var tokens = await this.deviceTokenRepo.findByAnotherTableCondition(
        { UserId: id },
        [
          {
            model: this.sequelize.getRepository(User),
            include: [this.sequelize.getRepository(SecurityMan)],
          },
        ]
      );
      let sendToken = tokens.filter(e => e.User.SecurityMan && e.User.SecurityMan.IsOnline).map(e => e.Token)
      await this.notificationService
        .create(
          noti,
          sendToken
        )
        .then((_) => {
          sendIds.push(id);
        });
    }
    return sendIds;
  };

  /**
   *
   * @param data have type is DangerousCaseCM
   */
  public readonly create = async (data: any): Promise<DangerousCase> => {
    console.log("case create");
    console.log(data);
    let userInCase: number[] = [];
    let building = null;
    let cameras: Camera[] = [];
    if (data.CreatedByCamera) {
      cameras = await this.cameraRepo.findByAnotherTableCondition(
        { Code: data.CreatedByCamera },
        [
          {
            model: this.sequelize.getRepository(Building),
            include: [this.sequelize.getRepository(SecurityMan)],
          },
        ]
      );
    }
    if (cameras.length > 0) {
      data.Code = `${cameras[0].Building.Code}-${Date.now() % 10000}`;
      data.Location = `Building: ${cameras[0].Building.Code}. Camera: ${cameras[0].Position}. Camera Code: ${cameras[0].Code}`;
      building = cameras[0].Building;
      data.BuildingId = cameras[0].Building.Id;
    } else {
      data.Code = `MD-${Date.now() % 10000}`;
      data.Location = `Outside`;
    }

    // Prohibited items in case
    if (data.ProhibitedItemNames) {
      //TODO: lay truoc khi khoi tao class
      let prohibitedItems = await this.prohibitedItemRepo.getAll({}, []);
      data.ProhibitedItemCases = [];
      for (let itemName of data.ProhibitedItemNames) {
        if (itemName === undefined) continue;
        if (itemName === null) continue;
        let item = prohibitedItems.filter((item) =>
          item.Name.toLowerCase().includes(itemName.toLowerCase())
        );
        if (item.length === 0) {
          throw new Error(`There is not have any item with name ${itemName}`);
        }
        data.ProhibitedItemCases.push({ ItemId: item[0].Id });
      }
    }

    // Students in case
    if (data.StudentUsernames) {
      // console.log(data.StudentUsernames)
      //TODO: lay truoc khi khoi tao class
      let users = await this.userRepo.getAll({}, [
        this.sequelize.getRepository(Student),
      ]);
      let pushedUsers: any = {};
      data.StudentCases = [];
      for (let username of data.StudentUsernames) {
        if (username.toLowerCase() === "unknown") continue;
        if (pushedUsers[username]) continue;
        let user = users.filter((user) =>
          user.Username.toLowerCase().includes(username.toLowerCase() + "@gmai")
        );

        //Get student of the relative
        if (user.length === 0) {
          let relatives = await this.relativeRepo.getAll({ IdentityCardNumber: username }, []);
          if (relatives.length === 0) continue;
          let relative = relatives[0];
          let student = await this.studentRepo.getById({ Id: relative.StudentId }, []);
          user = users.filter(user => user.Id === student.UserId);
          username = user[0].Username;
        }
        if (user.length === 0) {
          continue;
        }
        if (!user[0].Student) {
          console.log(`Username ${username} is not a student`);
          continue;
        }
        //Check username of student is existed or not
        if (pushedUsers[username]) continue;
        pushedUsers[username] = true;
        data.StudentCases.push({ StudentId: user[0].Student.Id });
        userInCase.push(user[0].Id);
      }
    }

    // initial step for dangerous case
    var caseHistoryStatus = await this.caseHistoryStatusRepository
      .getAll({ Order: 0 }, [])
      .then((result) => {
        if (result.length > 0) return result[0];
        else return null;
      });
    if (caseHistoryStatus == null) {
      throw new Error("Create fail : caseHistoryStatus do not have order = 0");
    }
    if (!data.CaseHistories) {
      data.CaseHistories = [
        {
          Subject: "New",
          Content: data.Description
            ? data.Description
            : "The new dangerous case",
          StatusId: caseHistoryStatus.Id,
          CreatedBy: data.CreatedBy,
        },
      ];
      data.CurrentStatusId = caseHistoryStatus.Id;
    } else {
      data.CaseHistories[0].StatusId = caseHistoryStatus.Id;
      data.CurrentStatusId = caseHistoryStatus.Id;
    }
    let result = await this.repository.create(data, [
      this.sequelize.getRepository(StudentCase),
      this.sequelize.getRepository(CaseHistory),
      this.sequelize.getRepository(ProhibitedItemCase),
      // this.sequelize.getRepository(CaseImage)
    ]);
    result.update({ Code: result.Id.toString().padStart(5, '0') });
    result.Policy = data.Policy;
    //sent notification to manager when
    await this.sendNotiCaseToManager(
      result,
      data.IsDangerous,
      data.CaseHistories[0].Content
    );
    //sent notification to current student
    if (userInCase.length > 0) {
      await this.sendNotiCaseToUsers(
        result,
        data.IsDangerous,
        data.CaseHistories[0].Content,
        userInCase
      );
    }
    if (building && building.SecurityMan) {
      await this.sendNotiCaseToBuildingGuard(
        result,
        data.IsDangerous,
        data.CaseHistories[0].Content,
        [building.SecurityMan.UserId as number]
      );
    }
    await this.sendNotiCaseToAreaGuard(
      result,
      data.IsDangerous,
      data.CaseHistories[0].Content
    );
    // Image in case
    for (let image of data.Images) {
      let imgUrl = await this.firebaseService.saveImageBase64(
        image.Image,
        data.Code,
        3
      );
      this.caseImageRepository.create(
        {
          ImageUrl: imgUrl,
          FaceData: JSON.stringify(image.FaceData),
          BodyData: JSON.stringify(image.BodyData),
          ProhibitedItemData: JSON.stringify(image.ProhibitedItemData),
          CaseId: result.Id,
        } as any,
        []
      );
    }
    return result;
  };
}
