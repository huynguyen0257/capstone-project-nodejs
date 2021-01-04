import { Request, Response } from "express";
import {
  UniversityService,
  AuthService,
  RoleService,
} from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import { UniversityVM, UniversityCM, UniversityUM } from "./../view-model";
import { hashSync } from "bcrypt";
import { plainToClass } from "class-transformer";
import { FirebaseService } from "../service";
import { Op } from "sequelize";
import { Role, UserRole } from "../model";

export class UniversityController {
  private readonly universityService: UniversityService;

  constructor(protected readonly sequelize: Sequelize) {
    this.universityService = new UniversityService(sequelize);
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    return await this.universityService
      .getAll({ ...(req.query as any), IsDelete: false }, [])
      .then((list) => {
        const result = list.map((model) =>
          plainToClass(UniversityVM, model, { excludeExtraneousValues: true })
        );
        return res.status(200).json(result);
      })
      .catch((err) =>
        res.status(400).json({ message: "Error " + err.message })
      );
  };
  public create = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    var data = UniversityCM.generateData<UniversityCM>(
      plainToClass(UniversityCM, req.body, { excludeExtraneousValues: true }),
      "",
      ""
    );
    return await this.universityService
      .create(data, [])
      .then((model) => {
        return res
          .status(201)
          .json(
            plainToClass(UniversityVM, model, { excludeExtraneousValues: true })
          );
      })
      .catch((err) =>
        res.status(400).json({ message: "Error " + err.message + err })
      );
  };
  public getById = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let university = await this.universityService.getById(
      { Id: req.params.id },
      []
    );
    let universityVM = plainToClass(UniversityVM, university,{
      excludeExtraneousValues: true,
    });
    universityVM.Name = university.Name;
    return res.status(200).json(universityVM);
  };
  public update = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const data = UniversityUM.generateData<UniversityUM>(
      plainToClass(UniversityUM, req.body, { excludeExtraneousValues: true }),
      ""
    );

    return await this.universityService
      .getById({ Id: data.Id }, [])
      .then((university) => {
        if (university) {
          return university
            .update(data)
            .then((_) => {
              return res
                .status(200)
                .json(
                  plainToClass(UniversityVM, _, {
                    excludeExtraneousValues: true,
                  })
                );
            })
            .catch((err) =>
              res.status(404).json({ message: "Update fail :" + err.message })
            );
        }
        return res.status(404).json({ message: "Id not found :" + data });
      })
      .catch((err) => res.status(400).json({ message: err.message }));
  };
}
