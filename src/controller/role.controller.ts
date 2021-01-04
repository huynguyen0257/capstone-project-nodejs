import { Request, Response } from "express";
import { RoleService, AuthService } from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import { RoleVM } from "./../view-model/Role.vm";
import { plainToClass } from "class-transformer";

export class RoleController {
    private readonly RoleService: RoleService;
    constructor( protected readonly sequelize: Sequelize ) {
        this.RoleService = new RoleService(sequelize);
    }
    public getAll = async (req: Request,res: Response): Promise<Response | undefined> => {
        return await this.RoleService
            .getAll({ ...(req.query as any) }, [])
            .then((list) => {
                const result = list.map((model) =>
                    plainToClass(RoleVM, model, { excludeExtraneousValues: true })
                );
                return res.status(200).json(result);
            })
            .catch((err) =>
                res.status(400).json({ message: "Error " + err.message })
            );
    };
}
