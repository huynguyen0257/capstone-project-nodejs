import e, { Request, Response } from "express";
import {
    DangerousCaseService,
    AuthService,
    RoleService,
    CaseHistoryStatusService,
    PolicyLevelService,
    CaseHistoryService,
    ProhibitedItemService,
    StudentService,
    StudentCaseService,
    PolicyService,
    BuildingService,
} from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import { plainToClass } from "class-transformer";
import {
    CaseHistoryCM,
    CaseHistoryVM,
    DangerousCaseCM,
    DangerousCaseDetailVM,
    DangerousCaseVM,
    StudentDangerousCaseVM,
} from "../view-model/dangerous.case.vm";
import {
    CaseHistory,
    CaseHistoryStatus,
    CaseImage,
    DangerousCase,
    Policy,
    PolicyLevel,
    ProhibitedItemCase,
    Room,
    StudentCase,
    University,
    User,
} from "../model";
import { strict } from "assert";
import console, { error } from "console";
import { Op } from "sequelize";
import { environment } from "../environment";
import { DetectService, FirebaseService, Frame } from "../service";
import { AppUtil } from "../util";
import { CaseImageService } from "../service/entity/case.image.service";
import gm from "gm";
gm.subClass({ imageMagick: true });
var request = require("request").defaults({ encoding: null });

export class DangerousCaseController {
    private readonly service: DangerousCaseService;
    private readonly caseImageService: CaseImageService;
    private readonly caseHistoryStatusService: CaseHistoryStatusService;
    private readonly detectServices: DetectService;
    private readonly policyLevelService: PolicyLevelService;
    private readonly caseHistoryService: CaseHistoryService;
    private readonly prohibitedItemService: ProhibitedItemService;
    private readonly studentService: StudentService;
    private readonly studentCaseService: StudentCaseService;
    private readonly policyService: PolicyService;
    private readonly buildingService: BuildingService;
    private readonly firebaseService: FirebaseService;
    constructor(protected readonly sequelize: Sequelize) {
        this.service = new DangerousCaseService(sequelize);
        this.caseHistoryStatusService = new CaseHistoryStatusService(sequelize);
        this.detectServices = new DetectService(sequelize);
        this.policyLevelService = new PolicyLevelService(sequelize);
        this.caseImageService = new CaseImageService(sequelize);
        this.caseHistoryService = new CaseHistoryService(sequelize);
        this.prohibitedItemService = new ProhibitedItemService(sequelize);
        this.studentService = new StudentService(sequelize);
        this.studentCaseService = new StudentCaseService(sequelize);
        this.policyService = new PolicyService(sequelize);
        this.buildingService = new BuildingService(sequelize);
        this.firebaseService = new FirebaseService();
    }

    public getAll = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        try {
            const result = AppUtil.getPageModel(req.query);
            const code = req.query.Code ? `%${req.query.Code}%` : "%%";
            delete req.query.Code;
            let params: any = { Code: { [Op.like]: code } };
            var dangerousCases: any[] = [];
            var dangerousCaseIds: number[] = [];

            //#region If search for attribute in DangerousCase table
            if (dangerousCaseIds.length > 0) {
                params = {
                    ...params,
                    Id: { [Op.or]: dangerousCaseIds },
                };
            }
            if (req.query.FromDate && req.query.ToDate) {
                params = {
                    ...params,
                    CreatedAt: {
                        [Op.between]: [
                            new Date(req.query.FromDate! as string),
                            new Date(
                                new Date(req.query.ToDate! as string).getTime() +
                                24 * 60 * 60 * 1000
                            ),
                        ],
                    },
                };
            }
            if (req.query.CaseHistoryStatusId) {
                params = {
                    ...params,
                    CurrentStatusId: parseInt(req.query.CaseHistoryStatusId as string),
                };
            }
            if (req.query.PolicyId) {
                params = {
                    ...params,
                    PolicyId: parseInt(req.query.PolicyId as string),
                };
            }
            if (req.query.BuildingId) {
                params = {
                    ...params,
                    BuildingId: parseInt(req.query.BuildingId as string),
                };
            }
            //#endregion

            dangerousCases = await this.service.getAll(
                params,
                [
                    this.sequelize.getRepository(Policy),
                    this.sequelize.getRepository(CaseImage),
                    this.sequelize.getRepository(CaseHistory),
                    this.sequelize.getRepository(StudentCase),
                ],
                [["CreatedAt", "DESC"]],
                result.info.pageSize,
                result.info.offset
            );
            result.info.total = await this.service.getTotal({
                where: params,
            });
            var dangerousCaseVMs: DangerousCaseVM[] = [];
            for (var d of dangerousCases) {
                let caseVM = plainToClass(DangerousCaseVM, d, {
                    excludeExtraneousValues: true,
                });
                if (d.PolicyId) {
                    caseVM.PolicyName = d.Policy.Name;
                    caseVM.PolicyColor = d.Policy.Color;
                    if (d.Policy.PolicyLevelId) {
                        let level = await this.policyLevelService.getById(
                            { Id: d.Policy.PolicyLevelId! },
                            []
                        );
                        caseVM.PolicyLevel = {
                            Name: level.Name,
                            Color: level.Color,
                            Level: level.Level,
                        };
                    }
                }
                if (d.CaseImages && d.CaseImages.length > 0) {
                    caseVM.CaseImage = d.CaseImages[0].ImageUrl;
                }
                caseVM.StatusId = d.CurrentStatusId;
                dangerousCaseVMs.push(caseVM);
            }
            result.results = dangerousCaseVMs;
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: "Error " + error.message });
        }
    };

    public getByStudent = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        const studentId = req.query.StudentId;
        const result = AppUtil.getPageModel(req.query);
        if (!studentId) {
            return res.status(400).json({ message: "Student Id could not be null" });
        }
        const cases = await this.service.findByAnotherTableCondition(
            {},
            [
                this.sequelize.getRepository(Policy),
                this.sequelize.getRepository(CaseImage),
                this.sequelize.getRepository(CaseHistory),
                {
                    model: this.sequelize.getRepository(StudentCase),
                    where: { StudentId: studentId } as any,
                },
            ],
            [["CreatedAt", "DESC"]],
            result.info.pageSize,
            result.info.offset
        );
        result.info.total = await this.service.getTotal({
            where: {},
            include: [
                {
                    model: this.sequelize.getRepository(StudentCase),
                    where: { StudentId: studentId } as any,
                },
            ],
        })
        var dangerousCaseVMs: DangerousCaseVM[] = [];
        for (var d of cases) {
            let caseVM = plainToClass(DangerousCaseVM, d, {
                excludeExtraneousValues: true,
            });
            if (d.PolicyId) {
                caseVM.PolicyName = d.Policy.Name;
                caseVM.PolicyColor = d.Policy.Color;
                if (d.Policy.PolicyLevelId) {
                    let level = await this.policyLevelService.getById(
                        { Id: d.Policy.PolicyLevelId! },
                        []
                    );
                    caseVM.PolicyLevel = {
                        Name: level.Name,
                        Color: level.Color,
                        Level: level.Level,
                    };
                }
            }
            if (d.CaseImages && d.CaseImages.length > 0) {
                caseVM.CaseImage = d.CaseImages[0].ImageUrl;
            }
            caseVM.StatusId = d.CurrentStatusId;
            dangerousCaseVMs.push(caseVM);
        }
        result.results = dangerousCaseVMs;
        return res.status(200).json(result);
    };
    public getById = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        try {
            var result: DangerousCaseDetailVM;
            var status = await this.caseHistoryStatusService.getAll({}, []);
            const dangerousCase = await this.service.getById({ Id: req.params.id }, [
                this.sequelize.getRepository(Policy),
                this.sequelize.getRepository(CaseHistory),
                this.sequelize.getRepository(CaseImage),
                this.sequelize.getRepository(ProhibitedItemCase),
                this.sequelize.getRepository(StudentCase),
            ]);
            if (!dangerousCase) {
                return res.status(404).json({ message: "Not found" });
            }
            result = plainToClass(DangerousCaseDetailVM, dangerousCase, {
                excludeExtraneousValues: true,
            });
            if (dangerousCase.PolicyId) {
                result.PolicyName = dangerousCase.Policy.Name;
                result.PolicyColor = dangerousCase.Policy.Color;
                result.PolicyFine = dangerousCase.Policy.Fine;
                if (dangerousCase.Policy.PolicyLevelId) {
                    let level = await this.policyLevelService.getById(
                        { Id: dangerousCase.Policy.PolicyLevelId! },
                        []
                    );
                    result.LevelName = level.Name;
                    result.LevelColor = level.Color;
                }
            }
            if (dangerousCase.ProhibitedItemCases) {
                result.ProhibitedItemNames = [];
                for (const item of dangerousCase.ProhibitedItemCases) {
                    result.ProhibitedItemNames.push(
                        (await this.prohibitedItemService.getById({ Id: item.ItemId }, []))
                            .Name
                    );
                }
            }
            if (dangerousCase.CaseHistories) {
                result.CaseHistories = [];
                for (var history of dangerousCase.CaseHistories.sort((a, b) =>
                    a.CreatedAt < b.CreatedAt ? 1 : -1
                )) {
                    var his = plainToClass(CaseHistoryVM, history, {
                        excludeExtraneousValues: true,
                    });
                    var stt = status.find((e) => e.Id == history.StatusId);
                    if (!stt) {
                        res.status(400).json({
                            message:
                                "Error: can not find CaseHisytoryStatus Id = " +
                                history.StatusId,
                        });
                    } else {
                        his.StatusId = stt.Id;
                        his.StatusName = stt.Name;
                        his.StatusOrder = stt.Order;
                        his.FileUrls = history.FileUrls ? JSON.parse(history.FileUrls) : [];
                    }
                    result.CaseHistories.push(his);
                }
                result.StatusId = dangerousCase.CurrentStatusId;
            }
            if (dangerousCase.StudentCases) {
                result.Students = [];
                for (const studentCase of dangerousCase.StudentCases) {
                    let studentId = studentCase.StudentId;
                    let student = await this.studentService.getById({ Id: studentId }, [
                        this.sequelize.getRepository(Room),
                        this.sequelize.getRepository(University),
                        this.sequelize.getRepository(User),
                    ]);
                    let studentDangerousCaseVm: StudentDangerousCaseVM = {
                        Id: student.Id,
                        Name: student.User.FullName,
                        Code: student.Code,
                        RoomCode: student.Room ? student.Room.Code : undefined,
                        UniversityName: student.University.Name,
                    };
                    result.Students.push(studentDangerousCaseVm);
                }
            }
            result.CaseImages = dangerousCase.CaseImages.map((e: CaseImage) => {
                return {
                    Id: e.Id,
                    ImageUrl: e.ImageUrl,
                    FaceData: e.FaceData,
                    ProhibitedItemData: e.ProhibitedItemData,
                    BodyData: e.BodyData
                };
            });
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: "Error: " + error.message });
        }
    };

    public create = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        let data = req.body;
        let policies = await this.policyService.getAll(
            { Name: { [Op.like]: "%Manual detected%" } },
            [this.sequelize.getRepository(PolicyLevel)]
        );
        if (policies.length === 0) {
            return res
                .status(400)
                .json({ message: "No policy manual detected found" });
        }

        data.Policy = policies[0];
        data.PolicyId = policies[0].Id;
        if (!req.body.BuildingId)
            res.status(400).json({ message: "Error: BuildingId is required" });
        if (!req.body.CreatedBy)
            res.status(400).json({ message: "Error: CreatedBy is required" });
        let building = await this.buildingService.getById(
            { Id: data.BuildingId },
            []
        );
        if (!building)
            res
                .status(400)
                .json({ message: `BuildingId ${data.BuildingId} not found` });

        try {
            //Create noti + send message via fire base
            var result = await this.service.create(data);
            return res.status(201).json(
                plainToClass(DangerousCaseVM, result, {
                    excludeExtraneousValues: true,
                })
            );
        } catch (error) {
            console.log("dangerous.case.controller error: " + error.message);
            return res
                .status(400)
                .json({ message: "Create fail : " + error.message });
        }
    };

    public studentCreate = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        let data = req.body;
        try {
            const username = JSON.parse(req.headers.extra as string).Username.replace("@gmail.com", "");
            //detect item
            let itemDetect = await this.detectServices.sendImageToDetectProhibitedItemLocation(data.Image);
            data.ProhibitedItemNames = itemDetect.data.info.map((e: any) => e.Code);

            //detect faceImages
            let faceDetect = await this.detectServices.sendImageToDetectFaceLocation(data.Image);
            data.Images = [];
            if (data.Image) {
                data.Images = [
                    {
                        Image: data.Image,
                        FaceData: faceDetect.data.info,
                        ProhibitedItemData : itemDetect.data.info,
                    },
                ];
            }
            // console.log("faceDetect.data: ");
            // console.log(faceDetect.data);
            // console.log(faceDetect.data.people.filter((usrname:string) => usrname != "Unknown"));
            data.StudentUsernames = [username];
            Array.prototype.push.apply(data.StudentUsernames, faceDetect.data.people);
            // console.log("data.StudentUsernames: ");
            // console.log(data.StudentUsernames);
            data.CreatedBy = username;
            //   data.CreatedByCamera = username;
            // console.log("itemDetect.data: ");
            // console.log(itemDetect.data);
            if(itemDetect.data.objects.length > 0) {
                let policies = await this.policyService.getAll(
                    { Name: { [Op.like]: "%Prohibited Item detected%" } },
                    [this.sequelize.getRepository(PolicyLevel)]
                );
                if (policies.length === 0) {
                    return res
                        .status(400)
                        .json({ message: "No policy mobile detected found" });
                }
                data.Policy = policies[0];
                data.PolicyId = policies[0].Id;
            }else{
                let policies = await this.policyService.getAll(
                    { Name: { [Op.like]: "%Mobile detected%" } },
                    [this.sequelize.getRepository(PolicyLevel)]
                );
                if (policies.length === 0) {
                    return res
                        .status(400)
                        .json({ message: "No policy mobile detected found" });
                }
                data.Policy = policies[0];
                data.PolicyId = policies[0].Id;
            }
            //Create noti + send message via fire base
            var result = await this.service.create(data);
            // var result = null;
            return res.status(201).json(
                plainToClass(DangerousCaseVM, result, {
                    excludeExtraneousValues: true,
                })
            );
        } catch (error) {
            console.log("dangerous.case.controller error: " + error.message);
            return res
                .status(400)
                .json({ message: "Create fail : " + error.message });
        }
    };

    public updateStep = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        const username = JSON.parse(req.headers.extra as string).Username;
        let result = {};
        var data = CaseHistoryCM.generateData<CaseHistoryCM>(
            plainToClass(CaseHistoryCM, req.body, { excludeExtraneousValues: true }),
            username,
            username
        );
        if (!data.Subject) return res.status(400).json({ message: "Subject is required" });
        if (!data.CaseId) return res.status(400).json({ message: "CaseId is required" });
        if (!data.StatusId) return res.status(400).json({ message: "StatusId is required" });
        let caseHistoryStatus = await this.caseHistoryStatusService.getById({ Id: data.StatusId }, []);
        if (!caseHistoryStatus) return res.status(400).json({ message: `CaseHistoryStatusId ${data.StatusId} is not found` });
        if (data.FileUrls) {
            result = { ...result, FileUrls: data.FileUrls };
            data.FileUrls =
                data.FileUrls.length > 0 ? JSON.stringify(data.FileUrls) : undefined;
        }
        // console.log(data.FileUrls);
        var dangerousCase = await this.service.getById({ Id: data.CaseId }, [this.sequelize.getRepository(StudentCase)]);
        if (!dangerousCase) return res.status(400).json({ message: `CaseId ${data.CaseId} not found.` });
        try {
            let updateParams = req.body.PolicyId? { CurrentStatusId: data.StatusId, PolicyId : req.body.PolicyId}:  { CurrentStatusId: data.StatusId };
            var caseHistory = await this.caseHistoryService
                .create(data, [])
                .then((res) => {
                    dangerousCase.update(updateParams);
                    return res;
                });
            if (dangerousCase.StudentCases) {
                let userIds = await (await this.studentService.getAll({ Id: { [Op.or]: dangerousCase.StudentCases.map(x => x.StudentId) }},[])).map(student => student.UserId);
                this.service.sendNotiCaseUpdatedToUsers(dangerousCase,userIds)
            }
            result = { ...result, CaseHistoryId: caseHistory.Id };
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: "Error: " + error.message });
        }
    };

    public uploadFileCase = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        const username = JSON.parse(req.headers.extra as string).Username;
        var Id = 0;
        if (req.params.id) Id = parseInt(req.params.id);
        var dangerousCase = await this.service.getById({ Id: Id }, []);
        if (!dangerousCase) {
            return res.status(404).json({ message: `Id ${req.params.id} not found` });
        }
        if (!req.file) return res.status(400).json({ message: "File is required" });
        let publishUrl = await this.firebaseService.saveFileCase(
            req.file,
            dangerousCase.Code
        );
        return res.status(200).json({ fileUrl: publishUrl });
    };

    public delete = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        var deviceToken = await this.service.getById({ Id: req.params.id }, []);
        if (!deviceToken) {
            return res
                .status(404)
                .json({ message: "Id not found :" + req.params.id });
        } else {
            try {
                await this.service.remove(req.params.id);
                return res.status(200).json({ message: "Delete successful" });
            } catch (error) {
                return res
                    .status(400)
                    .json({ message: "Delete fail : " + error.message });
            }
        }
    };

    public getDangerousCaseDaily = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        var dangerousCaseIds: number[] = [];
        let dailyCase: any[] = [];

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
        dailyCase = await this.service.getAll(
            params,
            [
                this.sequelize.getRepository(Policy),
                this.sequelize.getRepository(CaseImage),
                this.sequelize.getRepository(CaseHistory),
                this.sequelize.getRepository(StudentCase),
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

    public getImageByCaseImageId = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        let caseImageId = req.params.CaseImageId;
        let caseImage = await this.caseImageService.getById(
            { Id: caseImageId },
            []
        );
        let url = caseImage.ImageUrl;
        let faceData = JSON.parse(caseImage.FaceData);
        let itemData = JSON.parse(caseImage.ProhibitedItemData);
        let bodyData = JSON.parse(caseImage.BodyData);
        var base64img = await this.getBase64FromLink(url);
        res.set("Content-Type", "image/jpg");
        let buffer = await this.convertBase64ToImg(base64img, faceData, itemData,bodyData);
        return res.status(200).send(buffer);
    };
    private convertBase64ToImg = (
        base64: string,
        faceData: any,
        itemData: any,
        bodyData: any
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            var img = gm(Buffer.from(base64, "base64")).setFormat("jpg");
            this.detectServices.drawFaces(img, faceData as Array<any>);
            this.detectServices.drawBody(img, bodyData as Array<any>);
            this.detectServices.drawItem(img, itemData as Array<any>);
            img.toBuffer((err, buffer) => {
                if (!err) {
                    let baseImage = buffer.toString("base64");
                    var imgResult = Buffer.from(baseImage, "base64");
                    resolve(imgResult);
                } else {
                    resolve(err);
                }
            });
        });
    };

    private getBase64FromLink = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            request.get(url, function (error: any, response: any, body: any) {
                if (!error && response.statusCode == 200) {
                    resolve(Buffer.from(body).toString("base64"));
                } else {
                    reject(error);
                }
            });
        });
    };
}
