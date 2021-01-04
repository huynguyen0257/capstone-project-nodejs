import { Request, Response } from "express";
import {
  UserService,
  StudentService,
  UniversityService,
  RoomService,
  RoleService,
  NotificationService,
  BuildingService,
  StudentCaseService,
  DangerousCaseService,
  PolicyLevelService,
  PolicyService,
} from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import {
  StudentVM,
  StudentRegisterCM,
  StudentExcelCM,
  RoomVM,
  UniversityVM,
  UserCM,
  UniversityCM,
  DangerousCaseVM,
} from "./../view-model";
import { hashSync } from "bcrypt";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { FirebaseService } from "../service";
import { Op } from "sequelize";
import {
  CaseHistory,
  CaseImage,
  DangerousCase,
  DeviceToken,
  Policy,
  Role,
  Room,
  Student,
  StudentCase,
  University,
  User,
  UserRole,
} from "../model";
import { environment } from "../environment";
import { AppUtil } from "../util";

export class StudentController {
  private readonly studentService: StudentService;
  private readonly studentCaseService: StudentCaseService;
  private readonly userService: UserService;
  private readonly roomService: RoomService;
  private readonly buildingService: BuildingService;
  private readonly universityService: UniversityService;
  private readonly roleService: RoleService;
  private readonly policyService: PolicyService;
  private readonly notificationService: NotificationService;
  private readonly dangerousCaseService: DangerousCaseService;
  private readonly policyLevelService: PolicyLevelService;

  constructor(protected readonly sequelize: Sequelize) {
    this.studentService = new StudentService(sequelize);
    this.studentCaseService = new StudentCaseService(sequelize);
    this.userService = new UserService(sequelize);
    this.roomService = new RoomService(sequelize);
    this.buildingService = new BuildingService(sequelize);
    this.universityService = new UniversityService(sequelize);
    this.roleService = new RoleService(sequelize);
    this.policyService = new PolicyService(sequelize);
    this.notificationService = new NotificationService(sequelize);
    this.dangerousCaseService = new DangerousCaseService(sequelize);
    this.policyLevelService = new PolicyLevelService(sequelize);
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const result = AppUtil.getPageModel(req.query);
    let {
      BuildingId,
      Code,
      Fullname,
      RoomCode,
      UniversityId,
      OrderBy,
      OrderType,
    } = req.query;
    OrderBy = OrderBy ? OrderBy : "Code";
    OrderType = OrderType ? OrderType : "ASC";
    const searchConfig: any = {};
    if (Code) searchConfig["Code"] = { [Op.like]: `%${Code}%` };
    if (UniversityId) searchConfig["UniversityId"] = UniversityId;
    const searchConfigUser: any = {};
    if (Fullname)
      searchConfigUser["Fullname"] = { [Op.like]: `%${Fullname}%` };
    const searchConfigRoom: any = {};
    if (RoomCode) searchConfigRoom["Code"] = { [Op.like]: `%${RoomCode}%` };
    if (BuildingId) searchConfigRoom["BuildingId"] = BuildingId;
    result.results = await this.studentService.findByAnotherTableCondition(
      searchConfig,
      [
        {
          model: this.sequelize.getRepository(User),
          where: searchConfigUser,
        },
        {
          model: this.sequelize.getRepository(Room),
          where: searchConfigRoom,
        },
        this.sequelize.getRepository(University),
      ],
      [[OrderBy, OrderType]],
      result.info.pageSize,
      result.info.offset
    );
    result.info.total = await this.studentService.getTotal({
      where: searchConfig,
      include: [
        {
          model: this.sequelize.getRepository(User),
          where: searchConfigUser,
        },
        {
          model: this.sequelize.getRepository(Room),
          where: searchConfigRoom,
        },
      ],
    });
    result.results = result.results.map((e) => {
      let vm = plainToClass(StudentVM, e.User, {
        excludeExtraneousValues: true,
      });
      vm.Code = e.Code;
      vm.DayIn = e.DayIn;
      vm.DayOut = e.DayOut;
      vm.Id = e.Id;
      vm.UserId = e.User.Id;
      if (e.Room) {
        vm.RoomCode = e.Room.Code;
      } else {
        vm.RoomCode = "";
      }
      vm.UniversityId = e.University.Id;
      return vm;
    });
    return res.status(200).json(result);
  };
  public getById = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let student = await this.studentService.getById({ Id: req.params.id }, [
      this.sequelize.getRepository(User),
      this.sequelize.getRepository(Room),
      this.sequelize.getRepository(University),
    ]);
    if (!student)
      return res.status(404).json({ message: "student is not found" });
    let studentVM = plainToClass(StudentVM, student.User, {
      excludeExtraneousValues: true,
    });
    studentVM.Code = student.Code;
    studentVM.Id = student.Id;
    studentVM.DayIn = student.DayIn;
    studentVM.DayOut = student.DayOut;
    studentVM.UserId = student.User.Id;
    if (student.Room) studentVM.RoomCode = student.Room.Code;
    studentVM.UniversityId = student.University.Id;
    return res.status(200).json(studentVM);
  };

  public getDangerousCase = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    var dangerousCaseIds: number[] = [];
    let dangerousCases: any[] = [];
    let user = await this.userService.getById({ Id: req.params.userId }, [
      this.sequelize.getRepository(Student),
    ]);
    let student = user.Student ? user.Student : undefined;

    if (student) {
      dangerousCaseIds = await (
        await this.studentCaseService.getAll({ StudentId: student.Id }, [
          this.sequelize.getRepository(DangerousCase),
        ])
      ).map((studentCase) => studentCase.CaseId);
    }
    if (dangerousCaseIds.length > 0) {
      dangerousCases = await this.dangerousCaseService.getAll(
        { Id: { [Op.or]: dangerousCaseIds } },
        [
          this.sequelize.getRepository(Policy),
          this.sequelize.getRepository(CaseImage),
          this.sequelize.getRepository(CaseHistory),
          this.sequelize.getRepository(StudentCase),
        ],
        [["CreatedAt", "DESC"]]
      );
      //get by day
    }

    var result: DangerousCaseVM[] = [];
    for (var d of dangerousCases) {
      let a = plainToClass(DangerousCaseVM, d, {
        excludeExtraneousValues: true,
      });
      if (d.PolicyId) {
        a.PolicyName = d.Policy.Name;
        a.PolicyColor = d.Policy.Color;
        if (d.Policy.PolicyLevelId) {
          let level = await this.policyLevelService.getById(
            { Id: d.Policy.PolicyLevelId! },
            []
          );
          a.PolicyLevel = {
            Name: level.Name,
            Color: level.Color,
            Level: level.Level,
          };
        }
      }
      if (d.CaseImages && d.CaseImages.length > 0) {
        a.CaseImage = d.CaseImages[0].ImageUrl;
      }

      if (d.CaseHistories) {
        a.StatusId = d.CaseHistories[d.CaseHistories.length - 1].StatusId;
      }
      result.push(a);
    }
    return res.status(200).json(result);
  };

  public getDangerousCaseDaily = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    var dangerousCaseIds: number[] = [];
    let dailyCase: any[] = [];
    let user = await this.userService.getById({ Id: req.params.userId }, [
      this.sequelize.getRepository(Student),
    ]);
    let student = user.Student;
    if (!student)
      return res.status(403).json({ message: "token is not student" });
    let params = {
      CreatedAt: {
        [Op.between]: [
          new Date(AppUtil.formatDate(new Date())),
          new Date(
            new Date(AppUtil.formatDate(new Date())).getTime() +
            24 * 60 * 60 * 1000
          ),
        ],
      },
    };
    dailyCase = await this.dangerousCaseService.findByAnotherTableCondition(
      params,
      [
        this.sequelize.getRepository(Policy),
        this.sequelize.getRepository(CaseImage),
        this.sequelize.getRepository(CaseHistory),

        {
          model: this.sequelize.getRepository(StudentCase),
          where: { StudentId: student ? student.Id : -1 },
        },
      ],
      [["CreatedAt", "DESC"]]
    );

    var result: DangerousCaseVM[] = [];
    for (var d of dailyCase) {
      let a = plainToClass(DangerousCaseVM, d, {
        excludeExtraneousValues: true,
      });
      if (d.PolicyId) {
        a.PolicyName = d.Policy.Name;
        a.PolicyColor = d.Policy.Color;
        if (d.Policy.PolicyLevelId) {
          let level = await this.policyLevelService.getById(
            { Id: d.Policy.PolicyLevelId! },
            []
          );
          a.PolicyLevel = {
            Name: level.Name,
            Color: level.Color,
            Level: level.Level,
          };
        }
      }
      if (d.CaseImages && d.CaseImages.length > 0) {
        a.CaseImage = d.CaseImages[0].ImageUrl;
      }

      if (d.CaseHistories) {
        a.StatusId = d.CaseHistories[d.CaseHistories.length - 1].StatusId;
      }
      result.push(a);
    }
    return res.status(200).json(result);
  };

  private findDuplicates = (arr: []) => {
    return arr.filter((item, index) => arr.indexOf(item) != index);
  };
  /**
   * Username = Email
   * Password = Email
   * Condition:
   *  Database must have Student role
   *  RoomCode must have in database
   *  */
  public createListStudent = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    // console.log(req.body);
    let rooms: any[] = [];
    let universities: any[] = (
      await this.universityService.getAll({}, [])
    ).map((university) =>
      plainToClass(UniversityVM, university, { excludeExtraneousValues: true })
    );
    let student_models: any[] = [];
    const students = req.body.Students;
    let valid = true;
    let role = await this.roleService.getAll(
      { Name: { [Op.like]: `%Student%` } },
      []
    );
    if (role.length === 0) {
      return res
        .status(400)
        .json({ message: "Database not have role Student", data: students });
    }
    //Get created Username
    const username = req.headers.extra
      ? JSON.parse(req.headers.extra as string).Username
      : "Unknown";

    //Check Email have been existed in database
    let usernames = await this.userService.getAll(
      { Username: { [Op.or]: students.map((s: any) => s.Email) } },
      []
    );
    if (usernames.length > 0) {
      let _usernames = usernames.map((u) => u.Username);
      students.map((s: any) => {
        if (_usernames.includes(s.Email)) {
          s.valid.push({ title: "Email", message: 'The email is duplidated in database' });
        }
        return s;
      });
      valid = false;
    }

    //For each student
    for (let student of students) {
      let data = StudentExcelCM.generateData<StudentExcelCM>(
        plainToClass(StudentExcelCM, student, {
          excludeExtraneousValues: true,
        }),
        username,
        username
      );

      //Process the room data
      let room = rooms.filter((room) => room.Code === data.RoomCode);
      if (room.length > 0) {
        // Check room gender
        if (student.Gender.includes("Nam") != room[0].Gender) {
          student.valid.push({ title: 'Room', message: 'The gender is conflict in this room' });
          valid = false;
        }
        data.RoomId = room[0].Id;
      } else {
        room = await this.roomService.getAll({ Code: data.RoomCode }, []);
        console.log(room);
        if (room.length === 0) {
          student.valid.push({ title: 'Room', message: 'room code is not found is database' });
          valid = false;
          break;
        }

        // Check room gender
        if (room[0].Students && room[0].Students.length != 0) {
          let user = await this.userService.getById(
            { Id: room[0].Students[0].UserId },
            []
          );
          if (user.Gender != student.Gender.includes("Nam")) {
            student.valid.push({ title: 'Room', message: 'The gender is conflict in this room' });
            valid = false;
          }
        }

        let a = plainToClass(RoomVM, room[0], {
          excludeExtraneousValues: true,
        });
        a.Gender = student.Gender.includes("Nam");
        rooms.push(a);
        data.RoomId = rooms.filter((room) => room.Code === data.RoomCode)[0].Id;
      }
      //Update room current student
      rooms.map((room) => {
        //Find current room need to check + update
        if (room.Code === data.RoomCode) {
          //Check if room is full
          if (room.CurrentStudent === room.NumberOfStudent) {
            student.valid.push({ title: 'Room', message: 'The size of room is full' });
            valid = false;
          } else {
            //Update room current student
            room.CurrentStudent++;
          }
        }
      });

      //Process university data
      let universityName = student.UniversityName.trim().replace(/\s\s+/g, " ");
      let university = universities.filter((uni) =>
        uni.Name.toLowerCase().includes(universityName.toLowerCase())
      );
      if (university.length > 0) {
        data.UniversityId = university[0].Id;
      } else {
        let university = await this.universityService.create(
          UniversityCM.generateData(
            { Name: universityName.toUpperCase() },
            username,
            username
          ),
          []
        );
        universities.push(
          plainToClass(UniversityVM, university, {
            excludeExtraneousValues: true,
          })
        );
        data.UniversityId = universities.filter((uni) =>
          uni.Name.toLowerCase().includes(universityName.toLowerCase())
        )[0].Id;
      }
      let dataCM = UserCM.generateData<UserCM>(
        plainToClass(UserCM, data, { excludeExtraneousValues: true }),
        username,
        username
      );

      //Create ModelCM instance
      dataCM.Student = {
        Code: data.Code,
        UniversityId: data.UniversityId,
        RoomId: data.RoomId,
        DayIn: data.DayIn,
        DayOut: data.DayOut,
      };
      dataCM.Username = dataCM.Email;
      dataCM.Password = hashSync(dataCM.Email, 10);
      dataCM.Gender = dataCM.Gender.includes("Nam");
      dataCM.UserRole = [
        {
          RoleId: role[0].Id,
          CreatedBy: username,
          UpdatedBy: username,
        },
      ];
      student_models.push(dataCM);
    }
    if (!valid) {
      return res.status(400).json({ message: 'invalidate data', data: students })
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
      Title: environment.notification.student_importing.data.title,
      Body: environment.notification.student_importing.data.success_body,
      Type: environment.notification.type.success_message,
      UserId: user.Id,
      CaseId: null,
      ActionClick:
        environment.notification.student_importing.web.fcmOption.actionLink,
      CreatedBy: username,
    };
    // try {
    this.userService
      .createList(student_models, {
        returning: true,
        include: [
          { model: this.sequelize.getRepository(UserRole), as: "UserRole" },
          { model: this.sequelize.getRepository(Student), as: "Student" },
        ],
      })
      .then(() => {
        this.notificationService.create(noti, tokens);
        //Update room
        rooms.map((room) => this.roomService.update(room, room.Id));
      })
      .catch((error) => {
        noti.Body = `${environment.notification.student_importing.data.fail_body}${error.message}`;
        noti.Type = environment.notification.type.fail_message;
        this.notificationService.create(noti, tokens);
      });
    return res.status(200).json({
      message:
        "Create successfully. There are notification when it get done!!!",
    });
  };
}
