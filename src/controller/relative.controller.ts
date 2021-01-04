import { Request, Response } from "express";
import {
  RelativeService,
  StudentService,
  AuthService,
  RelativeFaceImageService,
  UserService,
  BuildingService,
  RoomService,
} from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import {
  RelativeVM,
  RelativeCM,
  RelativeUM,
} from "./../view-model/relative.vm";
import { plainToClass } from "class-transformer";
import { Relative, RelativeFaceImage, Room, Student, User } from "../model";
import { environment } from "../environment";
import { FirebaseService } from "../service";
import { Op } from "sequelize";
import NodeCache from "node-cache";
import { AppUtil } from "../util";

export class RelativeController {
  private readonly relativeService: RelativeService;
  private readonly studentService: StudentService;
  private readonly userService: UserService;
  private readonly relativeFaceImageService: RelativeFaceImageService;
  private readonly firebaseService: FirebaseService;
  private readonly buildingService: BuildingService;
  private readonly roomService: RoomService;
  private io: SocketIO.Server;

  constructor(protected readonly sequelize: Sequelize, memCache: NodeCache, io: SocketIO.Server) {
    this.relativeService = new RelativeService(sequelize);
    this.studentService = new StudentService(sequelize);
    this.relativeFaceImageService = new RelativeFaceImageService(sequelize);
    this.firebaseService = new FirebaseService();
    this.userService = new UserService(sequelize);
    this.buildingService = new BuildingService(sequelize);
    this.roomService = new RoomService(sequelize);
    this.io = io;
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const result = AppUtil.getPageModel(req.query);
    const name = req.query.Name ? `%${req.query.Name}%` : "%%";
    const identityCardNumber = req.query.IdentityCardNumber ? `%${req.query.IdentityCardNumber}%` : "%%";
    delete req.query.Code;
    let params: any = { Name: { [Op.like]: name }, IdentityCardNumber: { [Op.like]: identityCardNumber } };
    if(req.query.TimeIn){
      let date = new Date(req.query.TimeIn as string);
      date.setHours(0, 0, 0, 0);
      let nextDate = new Date(date.toDateString());
      nextDate.setDate(date.getDate() + 1);
      params = {...params, TimeIn: {[Op.between] : [date,nextDate]}}
    }
    try {
      let relatives = (await this.relativeService.getAll(params,
        [this.sequelize.getRepository(Student)],
        [["CreatedAt", "DESC"]],
        result.info.pageSize,
        result.info.offset));
      result.results = [];
      for (const relative of relatives) {
        let vm = plainToClass(RelativeVM, relative, { excludeExtraneousValues: true });
        let user = await this.userService.getById({ Id: relative.Student.UserId }, []);
        vm.StudentName = user.FullName;
        vm.StudentCode = relative.Student.Code;
        result.results.push(vm);
      }
      result.info.total = await this.relativeService.getTotal({
        where: params,
      });
      return res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: "Error " + error.message })
    }
  };

  public getByIdentityCardNumber = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    return await this.relativeService
      .getAll({ IdentityCardNumber: req.query.IdentityCardNumber as string }, [])
      .then((list) => {
        let result: any;
        if (list.length === 0) return res.status(400).json({ message: "No identity card" });
        result = plainToClass(RelativeVM, list[0], { excludeExtraneousValues: true });
        return res.status(200).json(result);
      })
      .catch((err) =>
        res.status(400).json({ message: "Error " + err.message })
      );
  }

  public create = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const student = await this.studentService.getById(
        { id: req.body.StudentId },
        [this.sequelize.getRepository(User)]
      );
      const relative = await this.relativeService.getAll(
        { IdentityCardNumber: req.body.IdentityCardNumber, IsCheckout: false },
        []
      );
      if (relative.length > 0) {
        return res.status(400).json({
          message: `IdentityCardNumber : ${req.body.IdentityCardNumber} IS EXISTED`,
        });
      }
      if (!student)
        return res.status(404).json({ message: "Student id is invalid" });
      var data = RelativeCM.generateData<RelativeCM>(
        plainToClass(RelativeCM, req.body, { excludeExtraneousValues: true }), "", ""
      );
      data.IsCheckout = false;
      data.TimeOut = data.TimeIn;
      data.FrontIdentityCardImage = await this.firebaseService.saveImageBase64(data.FrontIdentityCardImage, `${student.User.Username}/${data.IdentityCardNumber}`, 1);
      data.BackIdentityCardImage = await this.firebaseService.saveImageBase64(data.BackIdentityCardImage, `${student.User.Username}/${data.IdentityCardNumber}`, 1);

      let result = await this.relativeService.create(data, [
        this.sequelize.getRepository(Student),
      ]);

      return res
        .status(201)
        .json(
          plainToClass(RelativeVM, result, { excludeExtraneousValues: true })
        );
    } catch (e) {
      return res.status(400).json({ message: "error: " + e.message });
    }
  };

  public checkOut = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      var relative = await this.relativeService.getById({ Id: req.params.id }, [this.sequelize.getRepository(Student), this.sequelize.getRepository(RelativeFaceImage)]);
      if (!relative) {
        return res
          .status(404)
          .json({ message: "Id not found :" + req.params.id });
      }
      // if (!relative.IsCheckout) {
      //   relative.IsCheckout = !relative.IsCheckout
      //   var result = await relative.save()
      //   this.userService.TriggerCheckoutToPython({
      //     Username: relative.IdentityCardNumber,
      //   });
      //   return res
      //     .status(200)
      //     .json({ status: (await this.relativeService.checkout(req.params.id)).IsCheckout });
      // }
      // else {
      //   return res.status(400).json({ message: 'Already check out!' });
      // }
      let result = await this.relativeService.checkout([relative]);

      return res
        .status(200)
        .json({ result: result });

    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  public registerFace = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const username = JSON.parse(req.headers.extra as string).Username;
      if (!req.body.FaceImages) return res.status(400).json({ message: "FaceImages is required" });
      if (!req.body.Id) return res.status(400).json({ message: "Id is required" });

      var relative = await this.relativeService.getById({ Id: req.body.Id }, [
        this.sequelize.getRepository(Student),
        this.sequelize.getRepository(RelativeFaceImage),
      ]);

      if (!relative) {
        res.status(404).json({ message: "Id not found :" + req.body.Id });
      }
      if (!relative.Student.RoomId) return res.status(404).json({ message: `Student ${relative.Student.Code} have been checkout or not existed in any room` })
      let room = await this.roomService.getById({ Id: relative.Student.RoomId }, [])


      //Get user profile of student
      let user = await this.userService.getById(
        { Id: relative.Student.UserId },
        []
      );

      // var publicUrl = await this.firebaseService.saveImage(req.file, student.Username, 1);
      if (relative.RelativeFaceImages
        && relative.RelativeFaceImages.length >= environment.numberImageOfFaceRecognizer) {
        (await this.relativeFaceImageService.getAll({ RelativeId: relative.Id }, [])).map((userFaceImage) => {
          // remove on firebase too
          this.firebaseService.removeUserFaceImages(userFaceImage.ImageUrl);
          this.relativeFaceImageService
            .remove(userFaceImage.Id)
            .then(() => console.log("Remove face image successfully"))
            .catch(() => console.log("Remove face image failed"));
        });
      }

      let count = 0;
      let avatarUrl = "";
      console.log(req.body.FaceImages.length);
      let faceImages: any[] = [];
      this.io.emit('registerRelativeFaceStatus', 0, req.body.FaceImages.length)
      for (let faceImage of req.body.FaceImages) {
        console.log(`register face at index ${count++}`)
        let publicUrl = await this.firebaseService.saveImageBase64(
          faceImage,
          `${user.Username}/${relative.IdentityCardNumber}`,
          1
        );
        if (req.body.FaceImages[8] == faceImage) {
          avatarUrl = publicUrl;
        }
        let data: any = {
          ImageUrl: publicUrl,
          RelativeId: relative.Id,
          CreatedBy: username,
        };
        this.relativeFaceImageService.create(data, []);
        relative.update({ Avatar: avatarUrl });

        this.io.emit('registerRelativeFaceStatus', count, req.body.FaceImages.length)
        faceImages.push(publicUrl)
      }
      //Call python api
      console.log(`this.userService.TriggerCreatedFaceImageToPython`);
      console.log({ Username: relative.IdentityCardNumber, IsRelative: true, ImageUrls: faceImages, BuildingId: room.BuildingId });
      this.userService.TriggerCreatedFaceImageToPython({ Username: relative.IdentityCardNumber, IsRelative: true, ImageUrls: faceImages, BuildingId: room.BuildingId });
      return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getAllRelativeFaceImage = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      let relatives: any[] = [];
      if (req.query.BuildingId) {
        let buildingRooms = (await this.buildingService.getById({ Id: req.query.BuildingId as string }, [this.sequelize.getRepository(Room)])).Rooms;
        if (!buildingRooms || buildingRooms.length === 0) {
          return res.status(400).json({ message: `Building ${req.query.BuildingId} not found any rooms` });
        }
        //get room on building
        let rooms = await this.roomService.getAll({ Id: { [Op.or]: buildingRooms.map(room => room.Id) } }, [this.sequelize.getRepository(Student)]);

        //get all userIds on building
        let studentIds: any[] = [];
        rooms.map(room => {
          if (room.Students && room.Students.length > 0) {
            Array.prototype.push.apply(studentIds, room.Students.map(student => student.Id))
          }
        });
        if (studentIds.length > 0) {
          relatives = await this.relativeService.getAll({ IsCheckout: false, StudentId: { [Op.or]: studentIds } }, [this.sequelize.getRepository(RelativeFaceImage)]);
        }
      } else {
        relatives = await this.relativeService.getAll({ IsCheckout: false }, [this.sequelize.getRepository(RelativeFaceImage)]);
      }
      let faceImages: any[] = [];
      // faceImages = await this.relativeFaceImageService.getAll({IsCheckout : false}, []);
      relatives.map(relative => {
        Array.prototype.push.apply(faceImages, relative.RelativeFaceImages!.map((faceImages: any) => faceImages.ImageUrl))
      })
      // const result = faceImages;
      return res.status(200).json({ ImageURLs: faceImages });
      // return res.status(200).json({ImageURLs: ""});
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error });
    }
  };
}
