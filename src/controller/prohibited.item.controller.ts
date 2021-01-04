import { Request, Response } from "express";
import { ProhibitedItemService } from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import { plainToClass } from "class-transformer";
import { Op } from "sequelize";
import {
  ProhibitedItemVM,
  ProhibitedItemCM,
  ProhibitedItemUM,
} from "../view-model/prohibited.item.vm";
import { ProhibitedItem } from "../model";
import { strict } from "assert";

export class ProhibitedItemController {
  private readonly prohibitedItemService: ProhibitedItemService;
  constructor(protected readonly sequelize: Sequelize) {
    this.prohibitedItemService = new ProhibitedItemService(sequelize);
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var prohibitedItems = await this.prohibitedItemService.getAll(
        { ...(req.query as any) },
        []
      );
      var result = prohibitedItems.map((d) => {
        return plainToClass(ProhibitedItemVM, d, {
          excludeExtraneousValues: true,
        });
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: "Error " + error.message });
    }
  };
  public create = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    // const username = JSON.parse(req.headers.extra as string).Username;
    // const role = await this.roleService.getById({id : req.body.RoleId},[]);
    var data = ProhibitedItemCM.generateData<ProhibitedItemCM>(
      plainToClass(ProhibitedItemCM, req.body, {
        excludeExtraneousValues: true,
      }),
      "",
      ""
    );
    return await this.prohibitedItemService
      .create(data, [])
      .then((model) => {
        return res
          .status(201)
          .json(
            plainToClass(ProhibitedItemVM, model, {
              excludeExtraneousValues: true,
            })
          );
      })
      .catch((err) =>
        res.status(400).json({ message: "Error " + err.message + err })
      );
  };
  public update = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    // const username = JSON.parse(req.headers.extra as string).Username;
    const data = ProhibitedItemUM.generateData<ProhibitedItemUM>(
      plainToClass(ProhibitedItemUM, req.body, {
        excludeExtraneousValues: true,
      }),
      ""
    );

    return await this.prohibitedItemService
      .getById({ Id: data.Id }, [])
      .then((prohibitedItem) => {
        if (prohibitedItem) {
          return prohibitedItem
            .update(data)
            .then((_) => {
              return res
                .status(200)
                .json(
                  plainToClass(ProhibitedItemVM, _, {
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
