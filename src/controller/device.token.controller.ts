import { Request, Response } from "express";
import { DeviceTokenService, AuthService, RoleService, UserService } from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import { DeviceTokenCM, DeviceTokenUM, DeviceTokenVM } from "./../view-model";
import { hashSync } from "bcrypt";
import { plainToClass } from "class-transformer";
import { FirebaseService } from "../service";
import { Op } from "sequelize";
import { DeviceToken } from "../model";

export class DeviceTokenController {
    private readonly service: DeviceTokenService;
    private readonly userService: UserService;
    constructor(
        protected readonly sequelize: Sequelize,
    ) {
        this.service = new DeviceTokenService(sequelize);
        this.userService = new UserService(sequelize);
    }

    public getAll = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        try {
            var deviceTokens = await this.service.getAll({ UserId: req.params.userId }, []);
            var result = deviceTokens.map(d =>
                plainToClass(DeviceTokenVM, d, { excludeExtraneousValues: true })
            )
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: "Error " + error.message });
        }
    };

    public getById = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        try {
            var result = await this.service.getById({ Id: req.params.id }, []);
            if(!result) {
                return res.status(404).json({message : "Not found"});
            }
            return res.status(200).json(plainToClass(DeviceTokenVM, result, { excludeExtraneousValues: true }));
        } catch (error) {
            res.status(400).json({ message: "Error: " + error.message })
        }
    };

    public getByUserId = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        if (req.query.userId === undefined) {
            return res.status(400).json({ message: "Error " + "userId is required" })
        }
        let user = await this.userService.getById({Id: req.query.userId as string},[]);
        if(!user) return res.status(400).json({ message: `UserId ${req.query.userId} not found` });
        try {
            var deviceTokens = await this.service.getAll({ userId: parseInt(req.query.userId as string) }, [])
            var result = deviceTokens.map(deviceToken => plainToClass(DeviceTokenVM, deviceToken, { excludeExtraneousValues: true }));
            return res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: "Error: " + error.message })
        }
    };

    public create = async (req: Request, res: Response): Promise<Response | undefined> => {
        const data = DeviceTokenCM.generateData<DeviceTokenCM>(plainToClass(DeviceTokenCM, req.body, { excludeExtraneousValues: true }), "", "");
        data.UserId = req.params.userId;
        if(!req.body.Token) return res.status(400).json({message: "Token is required"});
        if(!req.body.DeviceType) return res.status(400).json({message: "DeviceType is required"});
        try {
            let oldUser = await this.service.getById({Token: data.Token},[]);
            if(oldUser){
                await this.service.remove(oldUser.Id)
            }
            var result = await this.service.create(data, []);
            return res.status(201).json(plainToClass(DeviceTokenVM, result, { excludeExtraneousValues: true }));
        } catch (error) {
            return res.status(400).json({ message: "Create fail : " + error.message });
        }
    }

    public update = async (req: Request, res: Response): Promise<Response | undefined> => {
        const data = DeviceTokenUM.generateData<DeviceTokenUM>(plainToClass(DeviceTokenUM, req.body, { excludeExtraneousValues: true }), "");
        if(!data.Token) return res.status(400).json({message: "Token is required"});
        if(!data.DeviceType) return res.status(400).json({message: "DeviceType is required"});

        var deviceToken = await this.service.getById({ Id: data.Id }, []);
        if (!deviceToken) {
            return res.status(404).json({ message: `Device Token Id ${data.Id} not found` });
        } else {
            try {
                var result = deviceToken.update(data);
                return res.status(200).json(plainToClass(DeviceTokenVM, result, { excludeExtraneousValues: true }));
            } catch (error) {
                return res.status(400).json({ message: "Update fail : " + error.message });
            }
        }
    };

    public delete = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        var deviceToken = await this.service.getById({ Id: req.params.id }, []);
        if (!deviceToken) {
            return res.status(404).json({ message: "Id not found :" + req.params.id });
        } else {
            try {
                await this.service.remove(req.params.id);
                return res.status(200).json({ message: "Delete successful" });
            } catch (error) {
                return res.status(400).json({ message: "Delete fail : " + error.message });
            }
        }
    };
}
