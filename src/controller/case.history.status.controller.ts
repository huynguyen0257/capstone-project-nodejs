import { Request, Response } from "express";
// import { CaseHistoryStatus } from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import { CaseHistoryStatusVM, CaseHistoryStatusCM, CaseHistoryStatusUM } from "../view-model";
import { hashSync } from "bcrypt";
import { plainToClass } from "class-transformer";
import { Op } from "sequelize";
import { CaseHistoryStatus, CaseHistoryStatusFamily } from "../model";
import { CaseHistoryStatusService } from "../service/entity";

export class CaseHistoryStatusController {
    private readonly service: CaseHistoryStatusService;
    constructor(
        protected readonly sequelize: Sequelize,
    ) {
        this.service = new CaseHistoryStatusService(sequelize);
    }

    public getAll = async (
        req: Request,
        res: Response
    ): Promise<Response | undefined> => {
        try {
            let name = (req.query.name || "").toString();
            var CaseHistories = await this.service.getAll({ Name: { [Op.like]: `%${name}%` } }, [this.sequelize.getRepository(CaseHistoryStatusFamily)]);
            var result = CaseHistories.map(d => {
                let caseStatus = plainToClass(CaseHistoryStatusVM, d, { excludeExtraneousValues: true });
                if (d.CaseHistoryStatusFamilies && d.CaseHistoryStatusFamilies.length > 0) {
                    caseStatus.ParentId = d.CaseHistoryStatusFamilies.map(f => f.ParentId);
                }else{
                    caseStatus.ParentId = [];
                }
                return caseStatus;
            });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: "Error " + error.message });
        }
    };
    
}
