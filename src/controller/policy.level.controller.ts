import { Request, Response } from "express";
import {
  PolicyLevelService,
  AuthService,
  RoleService,
  CameraService,
} from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import { PolicyLevelVM } from "./../view-model";
import { plainToClass } from "class-transformer";

export class PolicyLevelController {
  private readonly policyLevelService: PolicyLevelService;
  constructor(protected readonly sequelize: Sequelize) {
    this.policyLevelService = new PolicyLevelService(sequelize);
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const PolicyLevels = await this.policyLevelService.getAll(
      { ...(req.query as any) },
      []
    );
    const result = PolicyLevels.map((model) =>
      plainToClass(PolicyLevelVM, model, { excludeExtraneousValues: true })
    );
    return res.status(200).json(result);
  };
}
