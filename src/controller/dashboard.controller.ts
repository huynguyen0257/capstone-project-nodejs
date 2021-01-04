import { University } from "./../model/university";
import { Building } from "./../model/building";
import { Request, Response } from "express";
import {
  BuildingService,
  AuthService,
  RoleService,
  CameraService,
  UserService,
  NotificationService,
  StudentService,
  PolicyService,
  UniversityService,
  DangerousCaseService,
  StudentCaseService,
  PolicyLevelService,
  SecurityManService,
  CaseHistoryStatusService,
} from "./../service/entity/index";
import { CreatedAt, Sequelize } from "sequelize-typescript";
import {
  BuildingVM,
  BuildingUM,
  CameraVM,
  BuildingCM,
  RoomVM,
  DangerousCaseVM,
} from "./../view-model";
import { plainToClass } from "class-transformer";
import {
  DeviceToken,
  Room,
  User,
  SecurityMan,
  DangerousCase,
  Student,
  Policy,
  CaseImage,
  CaseHistoryStatus,
  StudentCase,
} from "../model";
import { environment } from "../environment";
import { FirebaseService } from "../service";
import {
  DangerousCaseGroupByPolicyVM,
  NumberOfCaseGroupByBuildingVM,
  NumberOfDangerousCaseByMonthVM,
  NumberOfStudentGroupByBuildingVM,
  NumberOfStudentGroupByUniversityVM,
} from "../view-model/dashboard.vm";
import { Op } from "sequelize";
import { AppUtil } from "../util";
// import { User } from '../model';

export class DashboardController {
  private readonly buildingService: BuildingService;
  private readonly universityService: UniversityService;
  private readonly userService: UserService;
  private readonly studentService: StudentService;
  private readonly studentCaseService: StudentCaseService;
  private readonly policyService: PolicyService;
  private readonly policyLevelService: PolicyLevelService;
  private readonly dangerousCaseService: DangerousCaseService;
  private readonly securityManService: SecurityManService;
  private readonly caseStatusService: CaseHistoryStatusService;
  private caseHistoryStatuses: number[];
  constructor(protected readonly sequelize: Sequelize) {
    this.buildingService = new BuildingService(sequelize);
    this.universityService = new UniversityService(sequelize);
    this.userService = new UserService(sequelize);
    this.studentService = new StudentService(sequelize);
    this.studentCaseService = new StudentCaseService(sequelize);
    this.policyService = new PolicyService(sequelize);
    this.policyLevelService = new PolicyLevelService(sequelize);
    this.dangerousCaseService = new DangerousCaseService(sequelize);
    this.securityManService = new SecurityManService(sequelize);
    this.caseStatusService = new CaseHistoryStatusService(sequelize);
    this.caseHistoryStatuses = [];
    this.caseStatusService
      .getAll(
        {
          Name: {
            [Op.or]: [{ [Op.like]: "%Pending%" }, { [Op.like]: "%Rejection%" }],
          },
        },
        []
      )
      .then((res) => {
        this.caseHistoryStatuses = res.map((status) => status.Id);
        console.log(this.caseHistoryStatuses);
      });
  }

  public getDangerousCaseGroupByPolicy = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const { FilterBy } = req.query;
      const date = new Date();
      var firstDay = date;
      var lastDay = date;
      switch (FilterBy) {
        // MONTH
        case "1":
          firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
          break;
        // DAY
        case "2":
          firstDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          lastDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1
          );
          break;
        case "0":
        default:
          firstDay = new Date(date.getFullYear(), 0, 1);
          lastDay = new Date(date.getFullYear(), 12, 1);
          break;
      }
      var result: DangerousCaseGroupByPolicyVM[] = [];
      let policies = await this.policyService.getAll({}, [
        this.sequelize.getRepository(DangerousCase),
      ]);
      policies.map((policy) =>
        result.push({
          PolicyId: policy.Id,
          PolicyName: policy.Name,
          NumberOfCase: policy.DangerousCases
            ? policy.DangerousCases.filter(
                (d) =>
                  d.CreatedAt >= firstDay &&
                  d.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(d.CurrentStatusId)
              ).length
            : 0,
        })
      );
      return res.status(200).json({ DangerousCaseGroupByPolicy: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getDangerousCaseGroupByBuilding = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var result: NumberOfCaseGroupByBuildingVM[] = [];
      let buildings = await this.buildingService.getAll({}, []);
      const { FilterBy } = req.query;
      const date = new Date();
      var firstDay = date;
      var lastDay = date;
      switch (FilterBy) {
        // MONTH
        case "1":
          firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
          break;
        // DAY
        case "2":
          firstDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          lastDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1
          );
          break;
        case "0":
        default:
          firstDay = new Date(date.getFullYear(), 0, 1);
          lastDay = new Date(date.getFullYear(), 12, 1);
          break;
      }

      for (let building of buildings) {
        let NumberOfCase = await this.dangerousCaseService.getTotal({
          where: {
            CurrentStatusId: { [Op.notIn]: this.caseHistoryStatuses },
            CreatedAt: {
              [Op.between]: [firstDay, lastDay],
            },
          } as any,
          include: [
            {
              model: this.sequelize.getRepository(Building),
              where: { Id: building.Id },
            },
          ],
        });
        result.push({
          BuildingId: building.Id,
          BuildingCode: building.Code,
          NumberOfCase,
        });
      }
      return res.status(200).json({ DangerousCaseGroupByPolicy: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getNumberOfStudentGroupByBuilding = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var result: NumberOfStudentGroupByBuildingVM[] = [];
      let buildings = await this.buildingService.getAll({}, [
        this.sequelize.getRepository(Room),
      ]);
      buildings.map((building) => {
        let numberOfStudent = building.Rooms
          ? building.Rooms.reduce(
              (sum, current) => sum + current.CurrentStudent,
              0
            )
          : 0;

        result.push({
          BuildingId: building.Id,
          BuildingCode: building.Code,
          NumberOfStudent: numberOfStudent,
        });
      });
      return res.status(200).json({ NumberOfStudentGroupByBuilding: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getNumberOfStudentGroupByUniversity = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var result: NumberOfStudentGroupByUniversityVM[] = [];
      let universities = await this.universityService.getAll({}, []);
      for (let university of universities) {
        let NumberOfStudent = await this.studentService.getTotal({
          where: { UniversityId: university.Id },
          include: [
            {
              model: this.sequelize.getRepository(User),
              where: { IsActive: true },
            },
          ],
        });
        if (!NumberOfStudent) NumberOfStudent = 0;
        result.push({
          UniversityId: university.Id,
          UniversityName: university.Name,
          NumberOfStudent,
        });
      }
      return res.status(200).json({ NumberOfStudentGroupByUniversity: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
  public getNumberOfDangerousCaseByMonth = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const { FilterBy} = req.query;
    let Year = req.query.Year ? parseInt( req.query.Year.toString()) : new Date().getFullYear()
    try {
      var result: NumberOfDangerousCaseByMonthVM[] = [];
      // policies.map(policy => result.push( {PolicyId: policy.Id, NumberOfCase: policy.DangerousCases ? policy.DangerousCases.length : 0}))
      let dangerousCases = await this.dangerousCaseService.getAll({}, []);
      const date = new Date();
      date.setFullYear(Year);
      switch (FilterBy) {
        case "2":
          for (
            var i = 1;
            i <
            new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            i++
          ) {
            var firstDay = new Date(date.getFullYear(), date.getMonth(), i );
            var lastDay = new Date(
              date.getFullYear(),
              date.getMonth(),
              i+ 1
            );
            result.push({
              Month: `${i}D`,
              NumberOfCase: dangerousCases.filter(
                (element, index) =>
                  element.CreatedAt >= firstDay &&
                  element.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(element.CurrentStatusId)
              ).length,
              NumberOfStrangerCase: dangerousCases.filter(
                (element, index) =>
                  element.CreatedAt >= firstDay &&
                  element.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(element.CurrentStatusId) &&
                  element.PolicyId == 1
              ).length,
              NumberOfItemCase: dangerousCases.filter(
                (element, index) =>
                  element.CreatedAt >= firstDay &&
                  element.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(element.CurrentStatusId) &&
                  element.PolicyId == 2
              ).length,
            });
          }
          break;
        case "0":
        default:
          for (var i = 0; i < 12; i++) {
            var firstDay = new Date(date.getFullYear(), i, 1);
            var lastDay = new Date(date.getFullYear(), i + 1, 1);
            result.push({
              Month: `${i + 1}M`,
              NumberOfCase: dangerousCases.filter(
                (element, index) =>
                  element.CreatedAt >= firstDay &&
                  element.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(element.CurrentStatusId)
              ).length,
              NumberOfStrangerCase: dangerousCases.filter(
                (element, index) =>
                  element.CreatedAt >= firstDay &&
                  element.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(element.CurrentStatusId) &&
                  element.PolicyId == 1
              ).length,
              NumberOfItemCase: dangerousCases.filter(
                (element, index) =>
                  element.CreatedAt >= firstDay &&
                  element.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(element.CurrentStatusId) &&
                  element.PolicyId == 2
              ).length,
            });
          }
          break;
      }
      return res.status(200).json({ NumberOfDangerousCaseByMonth: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getDangerousCasePeriod = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let policyIdParam = req.query.PolicyId;
    let policyIds = policyIdParam ? (policyIdParam as string).split(",") : [];
    let user = await this.userService.getById({ Id: req.params.userId }, [
      this.sequelize.getRepository(Student),
    ]);
    let query: any = policyIds.length > 0 ? { Id: { [Op.or]: policyIds } } : {};
    let policies = await this.policyService.getAll(query, []);

    let student = user.Student ? user.Student : undefined;
    let result = [];
    if (policies.length != policyIds.length) {
      return res
        .status(400)
        .json({ message: "can not found all policy id : ", policyIdParam });
    }
    if (student) {
      var dangerousCases = await this.dangerousCaseService.findByAnotherTableCondition(
        {},
        [
          {
            model: this.sequelize.getRepository(StudentCase),
            where: {
              StudentId: student.Id,
            },
          },
          this.sequelize.getRepository(Policy),
        ],
        [["CreatedAt", "DESC"]]
      );
      var date = new Date();
      date.setHours(0, 0, 0, 0);
      let caseByDate = dangerousCases.filter(
        (element, index) =>
          element.CreatedAt.getDate() - date.getDate() === 0 &&
          policyIds.includes(element.PolicyId.toString())
      );
      result.push({
        Title: "Day",
        Data: policies.map((p) => {
          return {
            PolicyName: p.Name,
            CaseNumber: caseByDate.filter(
              (element, index) => element.PolicyId === p.Id
            ).length,
          };
        }),
      });
      //get by week
      var first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
      var last = first + 6; // last day is the first day + 6
      var firstDayOfWeek = new Date(date.setDate(first));
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 1);
      var lastDayOfWeek = new Date(date.setDate(last));
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 1);
      lastDayOfWeek.setHours(23, 59, 59, 99);
      let caseByWeek = dangerousCases.filter(
        (element, index) =>
          element.CreatedAt >= firstDayOfWeek &&
          element.CreatedAt <= lastDayOfWeek &&
          policyIds.includes(element.PolicyId.toString())
      );
      result.push({
        Title: "Week",
        Data: policies.map((p) => {
          return {
            PolicyName: p.Name,
            CaseNumber: caseByWeek.filter(
              (element, index) => element.PolicyId === p.Id
            ).length,
          };
        }),
      });

      //get by month
      var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 99);
      let caseByMonth = dangerousCases.filter(
        (element, index) =>
          element.CreatedAt >= firstDayOfMonth &&
          element.CreatedAt <= lastDayOfMonth &&
          policyIds.includes(element.PolicyId.toString())
      );
      result.push({
        Title: "Month",
        Data: policies.map((p) => {
          return {
            PolicyName: p.Name,
            CaseNumber: caseByMonth.filter(
              (element, index) => element.PolicyId === p.Id
            ).length,
          };
        }),
      });
    } else {
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
      var dangerousCases = await this.dangerousCaseService.getAll(
        params,
        [
          this.sequelize.getRepository(StudentCase),
          this.sequelize.getRepository(Policy),
        ],
        [["CreatedAt", "DESC"]]
      );
      var date = new Date();
      date.setHours(0, 0, 0, 0);
      let caseByDate = dangerousCases.filter(
        (element, index) =>
          element.CreatedAt.getDate() - date.getDate() === 0 &&
          policyIds.includes(element.PolicyId.toString())
      );
      result.push({
        Title: "Day",
        Data: policies.map((p) => {
          return {
            PolicyName: p.Name,
            CaseNumber: caseByDate.filter(
              (element, index) => element.PolicyId === p.Id
            ).length,
          };
        }),
      });
    }
    return res.status(200).json(result);
  };

  public getRegistedStudent = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      let registeredStudent = await this.studentService.getTotal({
        where: {},
        include: [
          {
            model: this.sequelize.getRepository(User),
            where: { IsRegisterFace: 1, IsActive: true },
          },
        ],
      });
      let allStudent = await this.studentService.getTotal({
        where: {},
        include: [
          {
            model: this.sequelize.getRepository(User),
            where: { IsActive: true },
          },
        ],
      });
      return res.status(200).json({ registeredStudent, allStudent });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getRegistedGuard = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      let registeredGuard = await this.securityManService.getTotal({
        where: {},
        include: [
          {
            model: this.sequelize.getRepository(User),
            where: { IsRegisterFace: 1, IsActive: true },
          },
        ],
      });
      let allGuard = await this.securityManService.getTotal({
        where: {},
        include: [
          {
            model: this.sequelize.getRepository(User),
            where: { IsActive: true },
          },
        ],
      });
      return res.status(200).json({ registeredGuard, allGuard });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  // BUILDING GUARD
  public getNumberOfDangerousCaseByMonthByBuilding = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
      const buildingId = req.params.Id;
      const { FilterBy } = req.query;
      try {
        var result: NumberOfDangerousCaseByMonthVM[] = [];
        // policies.map(policy => result.push( {PolicyId: policy.Id, NumberOfCase: policy.DangerousCases ? policy.DangerousCases.length : 0}))
        let dangerousCases = await this.dangerousCaseService.findByAnotherTableCondition(
          {},
          [
            {
              model: this.sequelize.getRepository(Building),
              where: { Id: buildingId },
            },
          ]
        );
        const date = new Date();
        switch (FilterBy) {
          case "2":
            for (
              var i = 1;
              i <
              new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
              i++
            ) {
              var firstDay = new Date(
                date.getFullYear(),
                date.getMonth(),
                i
              );
              var lastDay = new Date(
                date.getFullYear(),
                date.getMonth(),
                i+1
              );
              result.push({
                Month: `${i}D`,
                NumberOfCase: dangerousCases.filter(
                  (element, index) =>
                    element.CreatedAt >= firstDay &&
                    element.CreatedAt < lastDay &&
                    !this.caseHistoryStatuses.includes(element.CurrentStatusId)
                ).length,
                NumberOfStrangerCase: dangerousCases.filter(
                  (element, index) =>
                    element.CreatedAt >= firstDay &&
                    element.CreatedAt < lastDay &&
                    !this.caseHistoryStatuses.includes(element.CurrentStatusId) &&
                    element.PolicyId == 1
                ).length,
              });
            }
            break;
          case "0":
          default:
            for (var i = 0; i < 12; i++) {
              var firstDay = new Date(date.getFullYear(), i, 1);
              var lastDay = new Date(date.getFullYear(), i + 1, 1);
              result.push({
                Month: `${i + 1}M`,
                NumberOfCase: dangerousCases.filter(
                  (element, index) =>
                    element.CreatedAt >= firstDay &&
                    element.CreatedAt < lastDay &&
                    !this.caseHistoryStatuses.includes(element.CurrentStatusId)
                ).length,
                NumberOfStrangerCase: dangerousCases.filter(
                  (element, index) =>
                    element.CreatedAt >= firstDay &&
                    element.CreatedAt < lastDay &&
                    !this.caseHistoryStatuses.includes(element.CurrentStatusId) &&
                    element.PolicyId == 1
                ).length,
              });
            }
            break;
        }
        return res.status(200).json({ NumberOfDangerousCaseByMonth: result });
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
  };

  public getDangerousCaseGroupByPolicyByBuilding = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let buildingId = req.params.Id;
    try {
      const { FilterBy } = req.query;
      const date = new Date();
      var firstDay = date;
      var lastDay = date;
      switch (FilterBy) {
        // MONTH
        case "1":
          firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
          break;
        // DAY
        case "2":
          firstDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          lastDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1
          );
          break;
        case "0":
        default:
          firstDay = new Date(date.getFullYear(), 0, 1);
          lastDay = new Date(date.getFullYear(), 12, 1);
          break;
      }
      var result: DangerousCaseGroupByPolicyVM[] = [];
      let policies = await this.policyService.findByAnotherTableCondition({}, [
        {
          model:this.sequelize.getRepository(DangerousCase),
          where: {BuildingId: buildingId}
        }
      ]);
      policies.map((policy) =>
        result.push({
          PolicyId: policy.Id,
          PolicyName: policy.Name,
          NumberOfCase: policy.DangerousCases
            ? policy.DangerousCases.filter(
                (d) =>
                  d.CreatedAt >= firstDay &&
                  d.CreatedAt < lastDay &&
                  !this.caseHistoryStatuses.includes(d.CurrentStatusId)
              ).length
            : 0,
        })
      );
      return res.status(200).json({ DangerousCaseGroupByPolicy: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getRegisteredStudentByBuilding = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let buildingId = req.params.Id;
    try {
      let registeredStudent = await this.studentService.getTotal({
        where: {},
        include: [
          {
            model: this.sequelize.getRepository(User),
            where: { IsRegisterFace: 1, IsActive: true },
          },
          {
            model: this.sequelize.getRepository(Room),
            where: {BuildingId: buildingId}
          }
        ],
      });
      let allStudent = await this.studentService.getTotal({
        where: {},
        include: [
          {
            model: this.sequelize.getRepository(User),
            where: { IsActive: true },
          },
          {
            model: this.sequelize.getRepository(Room),
            where: {BuildingId: buildingId}
          }
        ],
      });
      return res.status(200).json({ registeredStudent, allStudent });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getNumberOfStudentGroupByUniversityByBuilding = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let buildingId = req.params.Id;
    try {
      var result: NumberOfStudentGroupByUniversityVM[] = [];
      let universities = await this.universityService.getAll({}, []);
      for (let university of universities) {
        let NumberOfStudent = await this.studentService.getTotal({
          where: { UniversityId: university.Id },
          include: [
            {
              model: this.sequelize.getRepository(User),
              where: { IsActive: true },
            },
            {
              model: this.sequelize.getRepository(Room),
              where: { BuildingId: buildingId },
            },
          ],
        });
        if (!NumberOfStudent) NumberOfStudent = 0;
        result.push({
          UniversityId: university.Id,
          UniversityName: university.Name,
          NumberOfStudent,
        });
      }
      return res.status(200).json({ NumberOfStudentGroupByUniversity: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}
