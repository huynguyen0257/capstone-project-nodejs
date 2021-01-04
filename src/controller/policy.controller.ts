import { Request, Response } from "express";
import {
  PolicyService,
  AuthService,
  RoleService,
  CameraService,
} from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import { PolicyVM } from "./../view-model";
import { plainToClass } from "class-transformer";

export class PolicyController {
  private readonly PolicyService: PolicyService;
  constructor(protected readonly sequelize: Sequelize) {
    this.PolicyService = new PolicyService(sequelize);
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const policies = await this.PolicyService.getAll(
      { ...(req.query as any) },
      []
    );
    const result = policies.map((model) =>
      plainToClass(PolicyVM, model, { excludeExtraneousValues: true })
    );
    return res.status(200).json(result);
  };
}
