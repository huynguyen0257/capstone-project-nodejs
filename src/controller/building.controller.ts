import { Request, Response } from "express";
import {
  BuildingService,
  AuthService,
  RoleService,
  CameraService,
  UserService,
  NotificationService,
  SecurityManService,
  StudentService
} from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import {
  BuildingVM,
  BuildingUM,
  CameraVM,
  BuildingCM,
  RoomVM,
} from "./../view-model";
import { plainToClass } from "class-transformer";
import { DeviceToken, Room, User, SecurityMan, Building, Student} from "../model";
import { environment } from "../environment";
import { FirebaseService } from "../service";

export class BuildingController {
  private readonly buildingService: BuildingService;
  private readonly userService: UserService;
  private readonly cameraService: CameraService;
  private readonly firebaseService: FirebaseService;
  private readonly notificationService: NotificationService;
  private readonly securityManService: SecurityManService;
  private readonly studentService: StudentService;


  constructor(protected readonly sequelize: Sequelize) {
    this.buildingService = new BuildingService(sequelize);
    this.cameraService = new CameraService(sequelize);
    this.userService = new UserService(sequelize);
    this.firebaseService = new FirebaseService();
    this.notificationService = new NotificationService(sequelize);
    this.securityManService = new SecurityManService(sequelize);
    this.studentService = new StudentService(sequelize);

  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const buildings = await this.buildingService.getAll(
        { ...(req.query as any) },
        [this.sequelize.getRepository(SecurityMan)],
        [['Code','ASC']]
      );
      let buildingVMs: BuildingVM[] = [];
      for (const building of buildings) {
        let vm = plainToClass(BuildingVM, building, {
          excludeExtraneousValues: true,
        });
        if (building.ManagerId) {
          vm.ManagerName = (
            await this.userService.getById({ Id: building.SecurityMan.Id! }, [])
          ).FullName;
        }
        buildingVMs.push(vm);
      }
      return res.status(200).json(buildingVMs);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getBuildingByGuard = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const guard = await this.securityManService.getById(
        { UserId: req.params.userId },
        [
          this.sequelize.getRepository(User),
          this.sequelize.getRepository(Building),
        ]
      );
      if (!guard.Building)
        return res.status(404).json({ message: "Building not found" });
      let vm = plainToClass(BuildingVM, guard.Building, {
        excludeExtraneousValues: true,
      });
      vm.ManagerName = guard.User.FullName;
      return res.status(200).json(vm);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getById = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const buildings = await this.buildingService.findByAnotherTableCondition({ Id: req.params.Id }, [
      this.sequelize.getRepository(Room),
      {
        model:this.sequelize.getRepository(SecurityMan),
        include:[
          this.sequelize.getRepository(User)
        ]
      },
    ]);
    if (!buildings || buildings.length != 1) {
      return res
        .status(404)
        .json({ message: `Building ${req.params.Id} not found` });
    }
    const building = buildings[0];
    const result = plainToClass(BuildingVM, building, {
      excludeExtraneousValues: true,
    });
    const groupBy = (objectArray: any, property: any) => {
      return objectArray.reduce((acc: any, obj: any) => {
        const key = obj[property];
        if (!acc[key]) {
          acc[key] = [];
        }
        // Add object to list for given key's value
        acc[key].push(obj);
        return acc;
      }, {});
    };
    if (building.Rooms) {
      result.Rooms = building.Rooms.map((room) =>
        plainToClass(RoomVM, room, {
          excludeExtraneousValues: true,
        })
      );

      result.RoomGroupBy = groupBy(result.Rooms, "Floor");
    }
    if (building.ManagerId) {
      result.ManagerName = building.SecurityMan.User.FullName
    }
    return res.status(200).json(result);
  };

  private pad = (num: any, size: number) => {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  };

  public createList = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const username = JSON.parse(req.headers.extra as string).Username;
    const buildings = req.body.Building;
    const rooms = req.body.Room;
    let building_datas = [];

    for (let building of buildings) {
      let data = BuildingCM.generateData<BuildingCM>(
        plainToClass(BuildingCM, building, { excludeExtraneousValues: true }),
        username,
        username
      );
      data.Rooms = rooms.filter((room: any) => room.BuildCode == data.Code);
      data.Rooms.map((room: any) => {
        room.Code = `${room.BuildCode}-${this.pad(room.Floor, 2)}-${this.pad(
          room.RoomNumber,
          2
        )}`;
        room.CurrentStudent = 0;
      });
      data.NumberOfStudent = data.Rooms.reduce(
        (sum: number, current: any) => sum + current.NumberOfStudent,
        0
      );
      data.NumberOfRoom = data.Rooms.length;
      data.NumberOfFloor = data.Rooms.reduce(
        (max: number, current: any) =>
          (max = max > current.Floor ? max : current.Floor),
        0
      );
      // console.log(data)
      building_datas.push(data);
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
      Title: environment.notification.building_importing.data.title,
      Body: environment.notification.building_importing.data.success_body,
      Type: environment.notification.type.success_message,
      UserId: user.Id,
      CaseId: null,
      ActionClick:
        environment.notification.building_importing.web.fcmOption.actionLink,
      CreatedBy: username,
    };
    this.buildingService
      .createList(building_datas, {
        returning: true,
        include: [{ model: this.sequelize.getRepository(Room), as: "Rooms" }],
      })
      .then(() => {
        this.notificationService.create(noti, tokens);
      })
      .catch((error) => {
        noti.Body = `${environment.notification.building_importing.data.fail_body} ${error.message}`;
        noti.Type = environment.notification.type.fail_message;
        this.notificationService.create(noti, tokens);
      });

    return res
      .status(200)
      .json({
        message:
          "Create successfully. There are notification when it get done!!!",
      });
  };

  public update = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const username = JSON.parse(req.headers.extra as string).Username;
    const data = BuildingUM.generateData<BuildingUM>(
      plainToClass(BuildingUM, req.body, { excludeExtraneousValues: true }),
      username
    );
    return await this.buildingService
      .getById({ Id: data.Id }, [])
      .then((building) => {
        if (building) {
          return building
            .update(data)
            .then((_) => {
              return res.status(200).json(
                plainToClass(BuildingVM, _, {
                  excludeExtraneousValues: true,
                })
              );
            })
            .catch((err) =>
              res.status(400).json({ message: "Update fail :" + err.message })
            );
        }
        return res.status(404).json({ message: "Id not found :" + data });
      })
      .catch((err) => res.status(400).json({ message: err.message }));
  };

  public updateBuildingImage = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let id = req.params.Id;
    var building = await this.buildingService.getById({ Id: id }, []);
    if (!building) {
      res.status(404).json({ message: "Id not found :" + req.params.id });
    }
    try {
      try{
        if (building.ImageUrl) {
          await this.firebaseService.removeAvatar(building.ImageUrl);
        }
      }catch(e){

      }
      
      building.ImageUrl = await this.firebaseService.saveImage(
        req.file,
        "",
        2
      );
      building.save();
      return res.status(200).json({ Link: building.ImageUrl });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public getCamera = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const cameras = await this.cameraService.getAll(
      { BuildingId: req.params.Id },
      []
    );
    const result = cameras.map((model) =>
      plainToClass(CameraVM, model, { excludeExtraneousValues: true })
    );
    return res.status(200).json(result);
  };
}
