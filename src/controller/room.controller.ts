import { Request, Response } from "express";
import {
  RoomService,
  AuthService,
  RoleService,
  UserService,
} from "./../service/entity/index";
import { Sequelize } from "sequelize-typescript";
import { RoomDetailVM, RoomVM, StudentVM } from "./../view-model";
import { plainToClass } from "class-transformer";
import { Building, Student } from "../model";

export class RoomController {
  private readonly roomService: RoomService;
  private readonly userService: UserService;

  constructor(protected readonly sequelize: Sequelize) {
    this.roomService = new RoomService(sequelize);
    this.userService = new UserService(sequelize);
  }

  public getAll = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    let rooms = await this.roomService.getAll({ ...(req.query as any) }, [
      this.sequelize.getRepository(Building),
      this.sequelize.getRepository(Student),
    ]);
    let roomVMs:RoomVM[] = [];
    for (const e of rooms) {
      let vm = plainToClass(RoomVM, e, {
        excludeExtraneousValues: true,
      });
      if (e.Building) vm.BuildingCode = e.Building.Code;
      if (e.Students && e.Students.length > 0) {

        let user = await this.userService.getById({Id: e.Students[0].UserId},[]);
        vm.Gender = user.Gender!;
      }
      roomVMs.push(vm);
    }
    // rooms.forEach((e) => {
      
    // });
    return res.status(200).json(roomVMs);
  };

  public getById = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const room = await this.roomService.getById({ Id: req.params.Id }, [
      this.sequelize.getRepository(Student),
      this.sequelize.getRepository(Building),
    ]);
    const roomVM = plainToClass(RoomDetailVM, room, {
      excludeExtraneousValues: true,
    });
    if (!room)
      return res.status(404).json({ message: "room is not found" });

    if (room.Students) {
      roomVM.Students = [];
      for (let student of room.Students) {
        let studentVM = plainToClass(
          StudentVM,
          (await this.userService.getById({ Id: student.UserId }, [])),
          { excludeExtraneousValues: true }
        );
        studentVM.Id = student.Id
        studentVM.UniversityId = student.UniversityId;
        studentVM.DayIn = student.DayIn;
        studentVM.DayOut = student.DayOut;

        roomVM.Students.push(studentVM);
      }
    }
    if (room.Building) {
      roomVM.BuildingId = room.Building.Id;
      roomVM.BuildingCode = room.Building.Code!;
    }
    return res.status(200).json(roomVM);
  };
}
