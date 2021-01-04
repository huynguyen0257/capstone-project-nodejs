import { Request, Response } from "express";
import {
  CameraService,
  AuthService,
  RoleService,
  BuildingService,
} from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import { CameraCM, CameraUM, CameraVM } from "./../view-model";
import { plainToClass } from "class-transformer";
import NodeCache from "node-cache";
import {
  FRAME_KEY,
  INFO_CAMERA_LIST,
  FACE_REGISTER_ENHANCER,
} from "../socket/hub.type";
import { Building } from "../model";
import { PagingVM } from "../view-model/paging.vm";
import { Op } from "sequelize";
import { AppUtil } from "../util";
import { DetectService } from "../service";

export class CameraController {
  private readonly cameraService: CameraService;
  private readonly buildingService: BuildingService;
  private readonly memCache: NodeCache;
  private readonly detectService: DetectService;
  private io: SocketIO.Server;

  constructor(
    protected readonly sequelize: Sequelize,
    memCache: NodeCache,
    io: SocketIO.Server
  ) {
    this.cameraService = new CameraService(sequelize);
    this.buildingService = new BuildingService(sequelize);
    this.detectService = new DetectService(sequelize);
    this.memCache = memCache;
    this.io = io;
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const result = AppUtil.getPageModel(req.query);
    var Code = req.query.Code;
    var BuildingId = req.query.BuildingId;
    let buildingSearch: any = {};
    if (BuildingId) {
      buildingSearch["Id"] = BuildingId;
    }
    delete req.query.Code;
    let query = {};
    query = req.query.Type ? { ...query, Type: req.query.Type } : { ...query };
    query = Code
      ? { ...query, Code: { [Op.like]: `%${Code}%` } }
      : { ...query };
      query = req.query.Status
      ? { ...query, Status: req.query.Status }
      : { ...query };
    const cameras = await this.cameraService.findByAnotherTableCondition(
      query,
      [
        {
          model: this.sequelize.getRepository(Building),
          where: buildingSearch,
        },
      ],
      [["Code", "ASC"]],
      result.info.pageSize,
      result.info.offset
    );
    result.results = cameras.map((model) => {
      let vm = plainToClass(CameraVM, model, { excludeExtraneousValues: true });
      vm.Image = this.memCache.get(FRAME_KEY + vm.Code);
      vm.BuildingCode = model.Building.Code
      return vm;
    });
    result.info.total = await this.cameraService.getTotal({
      where: query,
      include: [
        {
          model: this.sequelize.getRepository(Building),
          where: buildingSearch,
        },
      ],
    });
    return res.status(200).json(result);
  };

  //STATUS 0 READY
  //STATUS 1 ENABLED STREAMING
  public enableStatus = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      
      const camera = await this.cameraService.getById(
        { Id: req.params.Id },
        []
      );
      if(!camera) return res.status(404).json({message: 'Camera not found'});
      if (camera.Status === 1)
        return res.status(400).json({ message: "Camera already enable" });
      let result = await this.cameraService.update(
        { Status: 1 } as any,
        camera.Id
      );
      this.io.to(camera.SocketId).emit("enable_camera", camera.Code);
      if (result[0] > 0) {
        return res.status(200).json({ message: "OK" });
      } else {
        return res.status(400).json({ message: "Could not update" });
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  //STATUS 0 READY
  //STATUS 2 DISABLED STREAMING
  public disableStatus = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const camera = await this.cameraService.getById(
        { Id: req.params.Id },
        []
      );
      if (camera.Status === 2)
        return res.status(400).json({ message: "Camera already disable" });
      let result = await this.cameraService.update(
        { Status: 2 } as any,
        camera.Id
      );
      this.io.to(camera.SocketId).emit("disable_camera", camera.Code);
      if (result[0] > 0) {
        return res.status(200).json({ message: "OK" });
      } else {
        return res.status(400).json({ message: "Could not update" });
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  public create = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const data = CameraCM.generateData<CameraCM>(
        plainToClass(CameraCM, req.body, { excludeExtraneousValues: true }),
        "dev",
        "dev"
      );
      if(!data.Code) return res.status(400).json({message:`Code is required`});
      const camera = await this.cameraService.getAll({Code: data.Code},[]);
      if(camera.length > 0) return res.status(400).json({message:`Camera code ${data.Code} have been existed`});
      const building = await this.buildingService .getById({ Id: data.BuildingId },[]);
      if(!building) return res.status(400).json({message:`Building id ${data.BuildingId} not found`});
      if(!data.Type) return res.status(400).json({message:`Type is required`});
      const result = await this.cameraService.create(data, []);
      const cameras = await this.cameraService.getAll({}, [
        this.sequelize.getRepository(Building),
      ]);
      let _data = cameras.map((e) => {
        return {
          Id: e.Id,
          Position: e.Position,
          Code: e.Code,
          Building: {
            Id: e.Building.Id,
            Code: e.Building.Code,
            Location: e.Building.Location,
          },
        };
      });
      this.memCache.set(INFO_CAMERA_LIST, _data);
      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    console.log('update camera', req.body)

    const data = CameraUM.generateData<CameraUM>(
      plainToClass(CameraUM, req.body, { excludeExtraneousValues: true }),
      ""
    );
    try {
      var camera = await this.cameraService.getById({ Code: data.Code }, []);
      if (!camera) {
        return res
          .status(404)
          .json({ message: `camera ${data.Code} not found`});
      }
      // if(!data.Type) return res.status(400).json({message:`Type is required`});
      if (data.IsOn !== undefined && camera.IsOn !== data.IsOn) {
        data["Status"] = 2;
      }
      this.io.emit("updateCameraIsOn", camera.Id);
      // let building = await this.buildingService.getById({ Id: data.BuildingId },[]);
      // if(!building) return res.status(400).json({message:`Building id ${data.BuildingId} not found`});
      await camera.update(data);
      const cameras = await this.cameraService.getAll({}, [
        this.sequelize.getRepository(Building),
      ]);
      let _data = cameras.map((e) => {
        return {
          Id: e.Id,
          Position: e.Position,
          Code: e.Code,
          Building: {
            Id: e.Building.Id,
            Code: e.Building.Code,
            Location: e.Building.Location,
          },
        };
      });
      this.memCache.set(INFO_CAMERA_LIST, _data);
      return res
        .status(200)
        .json(
          plainToClass(CameraVM, camera, { excludeExtraneousValues: true })
        );
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  public delete = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const result = await this.cameraService.remove(req.params.Id);
      if (result > 0) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json({ message: "fail to delete camera" });
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  public demo = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
      let _res = await this.detectService.sendImageToDetectFaceLocation(req.body.image);
      if (_res.data.info.length>0 ) {
        console.log("this.detectServices.base64ToFile(image);")
        let images = this.memCache.get(FACE_REGISTER_ENHANCER);
        if (!images) images = [];
        (images as Array<any>).push({image:req.body.image, info: _res.data.info[3]});
        this.memCache.set(FACE_REGISTER_ENHANCER, images);
      }
      return res.status(200).json({message:'OK'})
  };
}
