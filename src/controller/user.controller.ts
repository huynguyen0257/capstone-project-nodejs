import { UniversityService } from './../service/entity/university.service';
import { Request, Response } from "express";
import {
  UserService,
  AuthService,
  RoleService,
  UserFaceImageService,
  BuildingService,
  RoomService,
  RelativeService,
  NotificationService,
  StudentService,
} from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import {
  UserUM,
  UserVM,
  UserCM,
  RegisterCM,
  DeviceTokenVM,
} from "./../view-model";
import { hashSync } from "bcrypt";
import { plainToClass } from "class-transformer";
import { FirebaseService } from "../service";
import { Op } from "sequelize";
import NodeCache from "node-cache";
import {
  Building,
  DeviceToken,
  RelativeFaceImage,
  Role,
  Room,
  SecurityMan,
  Student,
  University,
  User,
  UserFaceImage,
  UserRole,
} from "../model";
import { FACE_REGISTER_ENHANCER } from "../socket/hub.type";
import { environment } from "../environment";
import { any } from "bluebird";
import { RelativeVM } from "../view-model/relative.vm";
import { AppUtil } from "../util";
import { relative } from 'path';
import { error } from 'console';
import { isBuffer } from 'util';

export class UserController {
  private readonly memCache: NodeCache;
  private readonly userService: UserService;
  private readonly studentService: StudentService;
  private readonly relativeService: RelativeService;
  private readonly roleService: RoleService;
  private readonly authService: AuthService;
  private readonly userFaceImageService: UserFaceImageService;
  private readonly buildingService: BuildingService;
  private readonly universityService: UniversityService;
  private readonly roomService: RoomService;
  private readonly firebaseService: FirebaseService;
  private readonly notificationService: NotificationService;
  private io: SocketIO.Server;

  constructor(
    protected readonly sequelize: Sequelize,
    memCache: NodeCache,
    io: SocketIO.Server
  ) {
    this.memCache = memCache;
    this.userService = new UserService(sequelize);
    this.studentService = new StudentService(sequelize);
    this.relativeService = new RelativeService(sequelize);
    this.roleService = new RoleService(sequelize);
    this.authService = new AuthService(sequelize);
    this.userFaceImageService = new UserFaceImageService(sequelize);
    this.firebaseService = new FirebaseService();
    this.notificationService = new NotificationService(sequelize);
    this.buildingService = new BuildingService(sequelize);
    this.roomService = new RoomService(sequelize);
    this.universityService = new UniversityService(sequelize);
    this.io = io;
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const result = AppUtil.getPageModel(req.query);
      let {
        Username,
        Fullname,
        RoleId,
        Status,
        OrderBy,
        OrderType,
      } = req.query;
      OrderBy = OrderBy ? OrderBy : "Username";
      OrderType = OrderType ? OrderType : "ASC";
      const searchConfig: any = {};
      if (Username) searchConfig["Username"] = { [Op.like]: `%${Username}%` };
      if (Fullname) searchConfig["Fullname"] = { [Op.like]: `%${Fullname}%` };
      if (Status && Status.length == 1) searchConfig["IsActive"] = Status;
      const searchConfigRole: any = {};
      if (RoleId) searchConfigRole["RoleId"] = RoleId;
      const users = await this.userService.findByAnotherTableCondition(
        searchConfig,
        [
          {
            model: this.sequelize.getRepository(UserRole),
            where: searchConfigRole,
          },
        ],
        [[OrderBy, OrderType]],
        result.info.pageSize,
        result.info.offset
      );

      result.results = users.map((model) => {
        let res = plainToClass(UserVM, model, {
          excludeExtraneousValues: true,
        });
        res.RoleId = model.UserRole[0].RoleId;
        return res;
      });
      result.info.total = await this.userService.getTotal({
        where: searchConfig,
        include: [
          {
            model: this.sequelize.getRepository(UserRole),
            where: searchConfigRole,
          },
        ],
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error });
    }
  };

  public getAllDeactivate = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let users = await this.userService.getAll({ IsActive: false }, [
      this.sequelize.getRepository(UserFaceImage)
    ]);
    const ImageURLs = []
    for (let user of users) {
      if (user.UserFaceImages) {
        for (let image of user.UserFaceImages) {
          ImageURLs.push(image.ImageUrl)
        }
      }

    }
    return res.status(200).json({ ImageURLs });
  }

  public getAllUserFaceImage = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      let faceImages: any[] = [];
      if (req.query.BuildingId) {
        let buildingRooms = (
          await this.buildingService.getById(
            { Id: req.query.BuildingId as string },
            [this.sequelize.getRepository(Room)]
          )
        ).Rooms;
        if (!buildingRooms || buildingRooms.length === 0) {
          return res.status(200).json({ ImageURLs: [] });
        }
        //get room on building
        let rooms = await this.roomService.getAll(
          { Id: { [Op.or]: buildingRooms.map((room) => room.Id) } },
          [this.sequelize.getRepository(Student)]
        );

        //get all userIds on building
        let userIds: any[] = [];
        rooms.map((room) => {
          if (room.Students && room.Students.length > 0) {
            Array.prototype.push.apply(
              userIds,
              room.Students.map((student) => student.UserId)
            );
          }
        });
        if (userIds.length != 0) {
          (
            await this.userService.getAll(
              {
                Id: { [Op.or]: userIds as number[] },
                IsActive: true,
                IsRegisterFace: 1,
              },
              [this.sequelize.getRepository(UserFaceImage)]
            )
          ).map((user: any) => {
            if (user.UserFaceImages && user.UserFaceImages.length > 0) {
              // faceImages.concat(user.UserFaceImages)
              Array.prototype.push.apply(faceImages, user.UserFaceImages);
            }
          });
        }
      } else {
        let users = await this.userService.getAll(
          { IsActive: true, IsRegisterFace: 1 },
          [this.sequelize.getRepository(UserFaceImage)]
        );
        users.map((user) => {
          if (user.UserFaceImages && user.UserFaceImages.length > 0) {
            Array.prototype.push.apply(faceImages, user.UserFaceImages);
          }
        });
      }
      const result = faceImages.map((model) => model.ImageUrl);
      return res.status(200).json({ ImageURLs: result });
      // return res.status(200).json({ImageURLs: ""});
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error });
    }
  };
  public getAllSecurityManFaceImage = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let users = await this.userService.getAll({ IsActive: (req.query.IsActive as string).toLowerCase().includes('true') }, [this.sequelize.getRepository(SecurityMan), this.sequelize.getRepository(UserFaceImage)]);
    const result: string[] = [];
    users.forEach((user) => {
      if (user.SecurityMan && user.UserFaceImages) {
        Array.prototype.push.apply(result, user.UserFaceImages.map(userfaceimage => userfaceimage.ImageUrl));
      }
    })
    return res.status(200).json({ ImageURLs: result });
  };

  public getUserAvatar = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let user = await this.userService.getById({ Id: req.params.id }, []);
    if (!user)
      return res
        .status(404)
        .json({ message: "Id not found :" + req.params.id });
    res.set("Content-Type", "image/jpg");
    return res.status(200).send(user.Avatar);
  };

  public getById = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let user = await this.userService.getById({ Id: req.params.id }, [
      this.sequelize.getRepository(UserRole),
      this.sequelize.getRepository(Student),
      this.sequelize.getRepository(SecurityMan),
    ]);
    if (!user)
      return res
        .status(404)
        .json({ message: "Id not found :" + req.params.id });
    let result = plainToClass(UserVM, user, { excludeExtraneousValues: true });
    result.RoleId = user.UserRole[0].RoleId;
    if (user.Student) {
      result.UniversityId = user.Student.UniversityId;
      result.RoomId = user.Student.RoomId;
      result.Code = user.Student.Code;
    } else if (user.SecurityMan) {
      result.Code = user.SecurityMan.Code;
    }
    return res.status(200).json(result);
  };

  public getByCode = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let users = await this.userService.findByAnotherTableCondition(
      { Username: req.params.Code + "@gmail.com" },
      [
        this.sequelize.getRepository(UserRole),
        {
          model: this.sequelize.getRepository(Student),
          include: [
            this.sequelize.getRepository(Room),
          ]
        },
        this.sequelize.getRepository(SecurityMan),
      ]
    );
    if (users.length > 0) {
      let result = plainToClass(UserVM, users[0], {
        excludeExtraneousValues: true,
      });
      result.RoleId = users[0].UserRole[0].RoleId;
      if (users[0].Student) {
        result.UniversityId = users[0].Student.UniversityId;
        result.Code = users[0].Student.Code;
        result.RoomCode = users[0].Student.Room ? users[0].Student.Room.Code : 'Old Student'
      } else if (users[0].SecurityMan) {
        result.Code = users[0].SecurityMan.Code;
      }
      return res.status(200).json(result);
    } else {
      let relatives = await this.relativeService.getAll(
        { IdentityCardNumber: req.params.Code },
        [this.sequelize.getRepository(Student)]
      );
      if (relatives.length === 0) {
        return res
          .status(404)
          .json({ message: "Code not found :" + req.params.Code });
      }
      let result = plainToClass(RelativeVM, relatives[0], {
        excludeExtraneousValues: true,
      });
      let studentUser = await this.userService.getById({ Id: relatives[0].Student.UserId }, []);
      if (relatives[0].Student.RoomId) {
        let studentRoom = await this.roomService.getById({ Id: relatives[0].Student.RoomId }, [this.sequelize.getRepository(Building)]);
        result.StudentRoom = studentRoom.Code + " (" + studentRoom.Building.Code + ")";
      }
      result.StudentName = studentUser.FullName;
      result.StudentCode = relatives[0].Student.Code;

      return res.status(200).json(result);
    }
  };

  public getAllFaceImageEnhance = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    return res
      .status(200)
      .json({ FaceImageEnhancer: this.memCache.get(FACE_REGISTER_ENHANCER) });
  };

  public create = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let user: any = null;
    try {
      const username = "dev";
      const role = await this.roleService.getById({ id: req.body.RoleId }, []);
      if (!role) return res.status(404).json({ message: "Role id is invalid" });
      let data = UserCM.generateData<UserCM>(
        plainToClass(UserCM, req.body, { excludeExtraneousValues: true }),
        username,
        username
      );
      if (data.Password && data.Password.length >= 6) {
        data.Password = hashSync(data.Password, 10);
      } else {
        return res.status(400).json({ message: "Password is invalid" });
      }
      const availableUser = await this.userService.getById({ Username: data.Username }, []);
      if (availableUser) {
        return res.status(400).json({ message: "Email had been taken from another account" });
      }
      data = {
        ...data,
        UserRole: [
          {
            RoleId: role.Id,
            CreatedBy: username,
            UpdatedBy: username,
          },
        ],
      };
      if (role.Name === "Student") {
        let dayIn = new Date();
        let dayOut = new Date();
        let student = await this.studentService.getAll({ Code: req.body.Code }, []);
        if (student.length > 0) return res.status(400).json({ message: `Student code ${req.body.Code} is already existed!` })
        dayOut.setFullYear(dayIn.getFullYear() + 4);



        //Process the room data
        if (!req.body.RoomId) return res.status(400).json({ message: "RoomId is required" });
        let room = await this.roomService.getById({ Id: req.body.RoomId }, [
          this.sequelize.getRepository(Student),
        ]);
        if (!room)
          return res.status(400).json({ message: "room not found" });
        if (room.Students && room.Students.length > 0) {
          let _userInRoom = await this.userService.getById(
            { Id: room.Students[0].UserId },
            []
          );
          if (_userInRoom && _userInRoom.Gender != data.Gender)
            return res
              .status(400)
              .json({
                message: `Room ${room.Code} have ${_userInRoom.Gender ? "male" : "female"
                  } gender`,
              });
          if (room.CurrentStudent === room.NumberOfStudent) {
            return res.status(400).json({ message: `Room ${room.Code} is full!` });
          }
        }
        // let currentStudent = room.CurrentStudent;
        room.update({ CurrentStudent: room.CurrentStudent + 1 });



        data.Student = {
          Code: req.body.Code,
          UniversityId: req.body.UniversityId,
          RoomId: req.body.RoomId,
          DayIn: dayIn,
          DayOut: dayOut,
        };
        let university = await this.universityService.getById({ Name: data.UniversityId }, [])
        if (!university) {
          university = await this.universityService.create({ Name: data.UniversityId } as any, []);
        }
        data.Student.UniversityId = university.Id
        user = await this.userService.create(data, [
          this.sequelize.getRepository(UserRole),
          this.sequelize.getRepository(Student),
        ]);
        user.UniversityId = data.Student.UniversityId;
        return res
          .status(201)
          .json(plainToClass(UserVM, user, { excludeExtraneousValues: true }));
      } else {
        data.SecurityMan = {
          Code: req.body.Code,
        };
        let result = await this.userService.create(data, [
          this.sequelize.getRepository(UserRole),
          this.sequelize.getRepository(SecurityMan),
        ]);
        return res
          .status(201)
          .json(
            plainToClass(UserVM, result, { excludeExtraneousValues: true })
          );
      }
    } catch (e) {
      if (user != null) {
        await this.userService.remove(user.Id);
      }
      return res.status(400).json({ message: e });
    }
  };

  public delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  public registerFace = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      let triggerCreatedFaceImageToPythonData = {};
      const username = JSON.parse(req.headers.extra as string).Username;
      if (!req.body.FaceImages) return res.status(400).json({ message: "FaceImages is required" });
      if (!req.body.UserId) return res.status(400).json({ message: "UserId is required" });

      var user = await this.userService.getById({ Id: req.body.UserId }, [
        this.sequelize.getRepository(UserFaceImage),
        // this.sequelize.getRepository(SecurityMan),
      ]);
      if (!user) {
        return res.status(404).json({ message: "Id not found :" + req.body.UserId });
      }
      // if(user.SecurityMan) {
      //   triggerCreatedFaceImageToPythonData = {
      //     ...triggerCreatedFaceImageToPythonData,
      //     IsSecurityMan: true,
      //   };
      // }
      let faceImages: string[] = [];
      if (
        user.UserFaceImages &&
        user.UserFaceImages.length >= environment.numberImageOfFaceRecognizer
      ) {
        (await this.userFaceImageService.getAll({ UserId: user.Id }, [])).map(
          (userFaceImage) => {
            this.userFaceImageService.remove(userFaceImage.Id).then(() => {
              this.firebaseService
                .removeUserFaceImages(userFaceImage.ImageUrl)
                .then(() => console.log("Remove face image successfully"))
                .catch(() => console.log("Remove face image failed"));
            });
          }
        );
      }
      let avatarUrl = "";
      let createFaceImages = req.body.FaceImages;
      let count = 0;
      console.log(createFaceImages.length);
      this.io.emit("registerFaceStatus", 0, createFaceImages.length);
      for (let faceImage of createFaceImages) {
        console.log(`register face ${count++}`);
        let publicUrl = await this.firebaseService.saveImageBase64(
          faceImage,
          user.Username,
          1
        );
        faceImages.push(publicUrl);
        if (req.body.FaceImages[8] == faceImage) {
          avatarUrl = publicUrl;
        }
        let data: any = {
          ImageUrl: publicUrl,
          UserId: user.Id,
          CreatedBy: username,
        };
        await this.userFaceImageService.create(data, []);
        this.io.emit("registerFaceStatus", count, createFaceImages.length);
      }

      //Update user Avatar & IsRegisterFace
      user.update({ IsRegisterFace: 1, Avatar: avatarUrl });
      //Call python api
      let buildingId = null;
      let student = await this.studentService.getAll({ UserId: user.Id }, [this.sequelize.getRepository(Room)]);
      if (student.length > 0) {
        buildingId = student[0].Room.BuildingId ? student[0].Room.BuildingId : null;
      }
      triggerCreatedFaceImageToPythonData = {
        ...triggerCreatedFaceImageToPythonData,
        Username: user.Username,
        IsRelative: false,
        ImageUrls: faceImages,
        BuildingId: buildingId
      }

      this.userService.TriggerCreatedFaceImageToPython(triggerCreatedFaceImageToPythonData).then(() => {
        console.log(`this.userService.TriggerCreatedFaceImageToPython :${triggerCreatedFaceImageToPythonData}`)
      });

      return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  };

  public FaceCheckYPR = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      if (!req.body.Image) return res.status(400).json({ message: "Image is required" });
      if (!base64regex.test(req.body.Image)) return res.status(400).json({ message: "Image not have type base64" });
      console.log(base64regex.test(req.body.Image));
      var result = await this.userFaceImageService.checkYPR(req.body.Image);
      console.log(result.data);
      return res.status(200).json(result.data);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public register = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const data = RegisterCM.generateData<RegisterCM>(
      plainToClass(RegisterCM, req.body, { excludeExtraneousValues: true }),
      req.body.Username,
      req.body.Username
    );
    // const data = RegisterCM.generateData<RegisterCM>(Object.assign(RegisterCM.prototype, req.body) as any as RegisterCM, req.body.Username, req.body.Username);

    if (data.Password) {
      data.Password = hashSync(data.Password, 10);
    }
    return await this.userService
      .create(data, [])
      .then((model) =>
        res.status(200).json({
          AccessToken: this.authService.generateToken(model.Username, ""),
          ExpiresIn: "24h",
        })
      )
      .catch((err) =>
        res.status(400).json({ message: "Register error: " + err })
      );
  };

  public update = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const username = JSON.parse(req.headers.extra as string).Username;
    const data = UserUM.generateData<UserUM>(
      plainToClass(UserUM, req.body, { excludeExtraneousValues: true }),
      username
    );
    var user = await this.userService.getById({ Id: data.Id }, [
      this.sequelize.getRepository(Student),
      this.sequelize.getRepository(UserFaceImage),
    ]);
    if (!user) {
      res.status(404).json({ message: "Id not found :" + req.params.id });
    } else {
      try {
        if (user.Student) {
          let updateStudentData = {};
          updateStudentData = data.UniversityId
            ? { ...updateStudentData, UniversityId: data.UniversityId }
            : { ...updateStudentData };

          updateStudentData = data.DayOut
            ? { ...updateStudentData, DayOut: data.DayOut }
            : { ...updateStudentData };


          //Process the room data
          if ((data.RoomId && data.RoomId != user.Student.RoomId) || (data.RoomId && !user.Student.RoomId)) {
            console.log("Process the room data")
            updateStudentData = data.RoomId
              ? { ...updateStudentData, RoomId: data.RoomId }
              : { ...updateStudentData };

            //Get current room data
            let room = await this.roomService.getById({ Id: data.RoomId }, [
              this.sequelize.getRepository(Student),
            ]);
            if (!room)
              return res.status(400).json({ message: "room not found" });
            if (room.Students && room.Students.length > 0) {
              let _userInRoom = await this.userService.getById(
                { Id: room.Students[0].UserId },
                []
              );
              if (_userInRoom && _userInRoom.Gender != data.Gender)
                return res
                  .status(400)
                  .json({
                    message: `Room ${room.Code} have ${_userInRoom.Gender ? "male" : "female"
                      } gender`,
                  });
              if (room.CurrentStudent === room.NumberOfStudent) {
                return res.status(400).json({ message: `Room ${room.Code} is full!` });
              }

            }

            //Update sang phong khac
            if (user.Student.RoomId) {
              console.log("Update student to another room");
              let oldRoom = await this.roomService.getById(
                { Id: user.Student.RoomId! },
                []
              );
              oldRoom.update({ CurrentStudent: oldRoom.CurrentStudent - 1 });
              if (user.UserFaceImages && user.UserFaceImages.length > 0) {
                await this.userService.TriggerCheckoutToPython({
                  Username: user.Username,
                  BuildingId: oldRoom.BuildingId,
                })
                  .then(() => console.log(`TriggerCheckoutToPython ${user.Username} from ${oldRoom.BuildingId}`))
                  .catch(error => console.log(`this.userService.TriggerCheckoutToPython error: ${error}`));
                this.userService.TriggerCreatedFaceImageToPython({
                  Username: user.Username,
                  IsRelative: false,
                  ImageUrls: user.UserFaceImages ? user.UserFaceImages.map(userfaceimage => userfaceimage.ImageUrl) : [],
                  BuildingId: room.BuildingId,
                })
                  .then(() => console.log(`TriggerCreatedFaceImageToPython ${user.Username} to ${room.BuildingId}`))
                  .catch(error => console.log(`this.userService.TriggerCreatedFaceImageToPython error: ${error}`));
              }
            } else { //Checkin student again
              console.log("Active student again and TriggerCreatedFaceImageToPython");
              console.log({
                Username: user.Username,
                IsRelative: false,
                ImageUrls: user.UserFaceImages ? user.UserFaceImages.map(userfaceimage => userfaceimage.ImageUrl) : [],
                BuildingId: room.BuildingId,
              })
              data.IsActive = true;
              if (user.UserFaceImages && user.UserFaceImages.length > 0) {
                this.userService.TriggerCreatedFaceImageToPython({
                  Username: user.Username,
                  IsRelative: false,
                  ImageUrls: user.UserFaceImages ? user.UserFaceImages.map(userfaceimage => userfaceimage.ImageUrl) : [],
                  BuildingId: room.BuildingId,
                }).catch(error => console.log(`this.userService.TriggerCreatedFaceImageToPython error: ${error}`));
              }
            }
            // let currentStudent = room.CurrentStudent;
            room.update({ CurrentStudent: room.CurrentStudent + 1 });
          }
          user.Student.update(updateStudentData);
        }
        var result = await user.update(data);
        return res
          .status(200)
          .json(
            plainToClass(UserVM, result, { excludeExtraneousValues: true })
          );
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }
  };

  public updateUserAvatar = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let Id = req.params.userId;
    if (req.params.id) Id = req.params.id;
    var user = await this.userService.getById({ Id: Id }, []);
    if (!user) {
      return res.status(404).json({ message: "Id not found :" + Id });
    }
    try {
      if (user.Avatar) {
        await this.firebaseService.removeAvatar(user.Avatar);
      }
      user.Avatar = await this.firebaseService.saveImage(
        req.file,
        user.Username,
        2
      );
      user.save();
      return res.status(200).json({ Link: user.Avatar });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public switchActive = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var user = await this.userService.getById({ Id: req.params.id }, [
        this.sequelize.getRepository(SecurityMan),
        this.sequelize.getRepository(UserFaceImage),
        this.sequelize.getRepository(Student),
      ]);
      if (!user) {
        res.status(404).json({ message: "Id not found :" + req.params.id });
      }
      user.IsActive = !user.IsActive;
      if (!user.IsActive && user.SecurityMan) {
        console.log(`DeActive SecurityMan and IsOnline = false`);
        user.SecurityMan.IsOnline = false;
      }
      let buildingId = null;
      let students = await this.studentService.getAll({ UserId: user.Id }, [this.sequelize.getRepository(Room)]);
      if (students.length > 0) {
        buildingId = students[0].Room.BuildingId ? students[0].Room.BuildingId : null;
      }
      if (!user.IsActive) {
        if (user.Student) {
          console.log(`DeActivate student at buildingId = ${buildingId}`);
          console.log({
            Username: user.Username,
            BuildingId: buildingId,
          });
          let relatives =  await this.relativeService.getAll({StudentId: user.Student.Id},[this.sequelize.getRepository(RelativeFaceImage),this.sequelize.getRepository(Student)]);
          this.relativeService.checkout(relatives);
          user.Student.update({ RoomId: null, DayOut: req.body.DayOut });
          students[0].Room.update({ CurrentStudent: students[0].Room.CurrentStudent - 1 })
        }
        if (user.UserFaceImages && user.UserFaceImages.length > 0) {
          this.userService.TriggerCheckoutToPython({
            Username: user.Username,
            BuildingId: buildingId,
          }).catch(error => console.log(`this.userService.TriggerCheckoutToPython: ${error}`));
        }
      } else {
        console.log(`Active securityman and TriggerCreatedFaceImageToPython`);
        console.log({
          Username: user.Username,
          IsRelative: false,
          ImageUrls: user.UserFaceImages ? user.UserFaceImages.map(userfaceimage => userfaceimage.ImageUrl) : [],
          BuildingId: buildingId,
        });
        if (user.UserFaceImages && user.UserFaceImages.length > 0) {
          try {
            this.userService.TriggerCreatedFaceImageToPython({
              Username: user.Username,
              IsRelative: false,
              ImageUrls: user.UserFaceImages.map(userfaceimage => userfaceimage.ImageUrl),
              BuildingId: buildingId,
            });
          } catch (error) {
            console.log(`this.userService.TriggerCreatedFaceImageToPython: ${error}`);
          }
        }
      }
      // var result = await user.update({IsActive: !user.IsActive});
      var result = await user.save();
      return res.status(200).json({ status: result.IsActive });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public removeFaceImage = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let user = await this.userService.getById({ Id: req.body.Id }, [this.sequelize.getRepository(UserFaceImage), this.sequelize.getRepository(Student)]);
    if (!user) return res.status(404).json({ message: `not found` });
    try {
      if (user.IsRegisterFace && user.UserFaceImages && user.UserFaceImages.length != 0) {
        user.UserFaceImages.forEach(userFaceImage => {
          this.userFaceImageService.remove(userFaceImage.Id);
          this.firebaseService.removeUserFaceImages(userFaceImage.ImageUrl);
        });
        let buildingId = user.Student ? (await this.roomService.getById({ Id: user.Student.RoomId! }, [])).BuildingId : null;
        this.userService.TriggerRemoveFaceImage({ Username: user.Username, BuildingId: buildingId })
      }
      user.update({ IsRegisterFace: 0 });
      return res.status(200).json({ message: 'User remove face image successfully' });
    } catch (error) {
      return res.status(404).json({ message: `error when update & remove image: ${error.message}` });
    }
  }
  public delete = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var user = await this.userService.getById({ Id: req.params.id }, []);
      if (!user) {
        res.status(404).json({ message: "Id not found :" + req.params.id });
      }
      var result = await this.userService.remove(req.params.id);
      if (result >= 0) {
        return res.status(200).json({ message: "Delete successful" });
      } else {
        return res.status(400).json({ message: "Delete 0 rows effected" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}
