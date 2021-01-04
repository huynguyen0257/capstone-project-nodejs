import { UserRole } from "./../model/user-role";
import { Student } from "./../model/student";
import { SecurityMan } from "./../model/security-man";
import { MailService } from "./../service";
import { AuthService, RoleService, UserService } from "./../service/entity";
import { Sequelize } from "sequelize-typescript";
import { Request, Response } from "express";
import { AuthVM, AuthGM, AuthResetPassword } from "./../view-model/auth.vm";
import NodeCache from "node-cache";
import { hashSync, compareSync } from "bcrypt";
import { Room, User } from "../model";
import { plainToClass } from "class-transformer";
import { UserVM, AuthChangePassword } from "../view-model";

export class AuthController {
  private readonly authService: AuthService;
  private readonly userService: UserService;
  private readonly memCache: NodeCache;
  private readonly mailService: MailService;
  private readonly sequelize: Sequelize;
  private readonly roleService: RoleService;
  constructor(sequelize: Sequelize, memCache: NodeCache) {
    this.authService = new AuthService(sequelize);
    this.userService = new UserService(sequelize);
    this.roleService = new RoleService(sequelize);
    this.mailService = new MailService();
    this.memCache = memCache;
    this.sequelize = sequelize;
  }
  public readonly useCheckToken = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const roles = await this.roleService.getAll({}, []);
    let user = (await this.userService.findByAnotherTableCondition({ Id: req.params.userId }, [
      this.sequelize.getRepository(UserRole),
      {
        model: this.sequelize.getRepository(Student),
        include:[
          this.sequelize.getRepository(Room),
        ]
      },
      this.sequelize.getRepository(SecurityMan),
    ]))[0];
    if (!user)
      return res
        .status(404)
        .json({ message: "Id not found :" + req.params.id });
    let result = plainToClass(UserVM, user, { excludeExtraneousValues: true });
    result.RoleId = user.UserRole[0].RoleId;
    result.RoleName = roles.filter((r) => r.Id === result.RoleId)[0].Name;
    if (user.Student) {
      result.UniversityId = user.Student.UniversityId;
      result.Code = user.Student.Code;
      result.RoomCode = user.Student.Room.Code
    } else if (user.SecurityMan) {
      result.Code = user.SecurityMan.Code;
    }
    return res.status(200).json(result);
  };
  public readonly login = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const account: AuthGM = AuthGM.generateData(req.body);
    const roles = await this.roleService.getAll({}, []);
    return await this.userService
      .getById({ Username: account.Username }, [
        this.sequelize.getRepository(UserRole),
        this.sequelize.getRepository(SecurityMan),
      ])
      .then(async (user) => {
        if (user) {
          if (!user.IsActive)
            return res.status(400).json({ message: "The account is disabled" });
          if (compareSync(account.Password, user.Password)) {
            const role = roles.filter(
              (r) => r.Id === user.UserRole[0].RoleId
            )[0].Name;
            if (role !== "Student" && user.SecurityMan) {
              user.SecurityMan.update({ IsOnline: true });
            }
            return res.status(200).json({
              AccessToken: this.authService.generateToken(user.Username, ""),
              ExpiresIn: "24h",
              Role: roles.filter((r) => r.Id === user.UserRole[0].RoleId)[0]
                .Name,
            });
          } else {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }
        } else {
          return res.status(404).json({ message: "Username is not found" });
        }
      })
      .catch((err) => res.status(400).json({ message: err.message }));
  };

  public readonly getResetCode = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const Email = req.query.Email;
    if (!Email || Email.length == 0)
      return res.status(400).json({ message: "Email is invalid" });
    const users = await this.authService.getUserByEmail(Email.toString());
    if (users.length == 0) {
      return res.status(404).json({ message: "Email is not found" });
    }
    const code = Math.floor(Math.random() * 10000);
    const stored = this.memCache.set(users[0].Email, code, 120); //2 min = 120 s
    if (!stored) {
      return res.status(500).json({ message: "Error to stored reset code" });
    }
    this.mailService.sendMail({
      to: users[0].Email,
      subject: "Reset Code",
      text: "Code is: " + code + "\n Date is " + new Date(),
    });
    return res.status(200).json({ mail: Email });
  };

  public readonly checkResetCode = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try {
      const data: AuthResetPassword = AuthResetPassword.generateData(req.body);
      if (!data.Email)
        return res.status(400).json({ message: "Email can not be null" });
      if (!data.Code)
        return res.status(400).json({ message: "Code can not be null" });
      const code = this.memCache.get(data.Email);
      if (!code || code != data.Code) {
        return res.status(400).json({ message: "Invalid Email or Code" });
      }
      this.memCache.ttl(data.Email, 240);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  public readonly postResetPassword = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const data: AuthResetPassword = AuthResetPassword.generateData(req.body);
    const code = this.memCache.get(data.Email);
    if (
      !code ||
      code != data.Code ||
      !data.Password ||
      data.Password.length < 6
    ) {
      return res.status(400).json({ message: "Invalid Email or Code" });
    }
    const users = await this.authService.getUserByEmail(data.Email.toString());
    if (users.length == 0) {
      return res.status(404).json({ message: "Email is not found" });
    }
    const user = users[0];
    const passwordHash = hashSync(data.Password, 10);
    return user
      .update({
        Password: passwordHash,
      })
      .then(() => {
        this.memCache.take(data.Email);
        return res.status(201).json({ message: "OK" });
      })
      .catch((e) => res.status(500).json({ message: e.message }));
    // return res.status(500).json({ message: err.message })
  };

  public readonly changePassword = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const data = plainToClass(AuthChangePassword, req.body, {
      excludeExtraneousValues: true,
    });
    console.log(data);
    const passwordHash = hashSync(data.NewPassword, 10);
    const user = await this.userService.getById({ Id: req.params.userId }, []);
    if (!compareSync(data.OldPassword, user.Password)) {
      return res.status(400).json({ message: "Invalid old password" });
    }
    return user
      .update({
        Password: passwordHash,
      })
      .then(() => {
        return res.status(201).json({ message: "OK" });
      })
      .catch((e) => res.status(500).json({ message: e.message }));
    // return res.status(500).json({ message: err.message })
  };

  public readonly testMemCache = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    const Email = req.query.Email;
    if (!Email || Email.length == 0)
      return res.status(400).json({ message: "Email is invalid" });
    const code = this.memCache.get(Email.toString());
    return res.status(200).json({ code: code });
  };

  public readonly logOut = async (
    req: Request,
    res: Response
  ): Promise<Response | undefined> => {
    try{
      const user = await this.userService.getById({ Id: req.params.userId }, [
        this.sequelize.getRepository(SecurityMan),
      ]);
      if (user.SecurityMan) await user.SecurityMan.update({ IsOnline: false });
      return res.status(200).json({ message: "logout successfully" });
    } catch(e) {
      return res.status(400).json({ message: "logout failure" });
    }
  };
}
