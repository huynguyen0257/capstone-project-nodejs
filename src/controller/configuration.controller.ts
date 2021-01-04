import { Request, Response } from "express";
import { ConfigurationService } from "./../service/entity/index";
import { Sequelize, Repository } from "sequelize-typescript";
import {
  ConfigurationVM,
  ConfigurationCM,
  ConfigurationUM,
} from "./../view-model";
import { hashSync } from "bcrypt";
import { plainToClass } from "class-transformer";
import { Configuration } from '../model/configuration';
import { WEIRD_HOURS_CONFIG } from "../socket/hub.type";
import NodeCache from "node-cache";

export class ConfigurationController {
  private readonly configurationService: ConfigurationService;
  private readonly memCache: NodeCache;

    
  constructor(protected readonly sequelize: Sequelize, memCache: NodeCache,) {
    this.configurationService = new ConfigurationService(sequelize);
    this.memCache = memCache;
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    console.log("getAll");
    return await this.configurationService
      .getAll({ ...(req.query as any) }, [])
      .then((list) => {
        const result = list.map((model) =>
          plainToClass(ConfigurationVM, model, {
            excludeExtraneousValues: true,
          })
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
    var data = ConfigurationCM.generateData<ConfigurationCM>(
      plainToClass(ConfigurationCM, req.body, {
        excludeExtraneousValues: true,
      }),
      "",
      ""
    );
    if(!data.Key) return res.status(400).json({message: "Missing Key"})
    data = await this.configurationService.getAll({ Key: req.body.Key }, []);
    if (data.length > 0) {
      return res.status(400).json({
        message: `Key : ${req.body.Key} IS EXISTED`,
      });
    }
    return await this.configurationService
      .create(data, [])
      .then((model) => {
        return res
          .status(201)
          .json(
            plainToClass(ConfigurationVM, model, {
              excludeExtraneousValues: true,
            })
          );
      })
      .catch((err) =>
        res.status(400).json({ message: "Error " + err.message + err })
      );
  };

    public getByKey = async (
        req: Request,
        res: Response
      ): Promise<Response | undefined> => {
        console.log("getByKey");
        if(!req.params.Key) return res.status(400).json({ message: "Key is required" });
        const configuration = await this.configurationService.getById({ Key: req.params.Key }, [
        ]);
        if (!configuration) {
          return res
            .status(404)
            .json({ message: `Configuration ${req.params.Key} not found` });
        }
        const result = plainToClass(ConfigurationVM, configuration, {
          excludeExtraneousValues: true,
        });
        result.Value = JSON.parse(result.Value)
        return res.status(200).json(result);
    }
    public update = async (
      req: Request,
      res: Response
    ): Promise<Response | undefined> => {
      const data = ConfigurationUM.generateData<ConfigurationUM>(
        plainToClass(ConfigurationUM, req.body, { excludeExtraneousValues: true }),
        ""
      );
      let configuration = await  this.configurationService
        .getById({ Key: data.Key }, [])
      if(!configuration) return res.status(404).json({ message: "configuration not found"})
      let result = await this.configurationService.update({Value: JSON.stringify(data.Value)} as any, configuration.Id)
      if(data.Key === WEIRD_HOURS_CONFIG) {
        this.memCache.set(WEIRD_HOURS_CONFIG, data.Value)
      }
      if(result[0] >0) return res.status(200).json({message: 'update successful'})
      return res.status(400).json({message: 'update failure'})
    };
}
