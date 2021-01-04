import { NextFunction, Request, Response } from "express";
import { Sequelize, Repository } from "sequelize-typescript";
import { sign, verify } from "jsonwebtoken";
import { environment } from "./../../environment";
import { IRepository, BaseRepository } from "./../../repository/generic/index";
import { User, UserRole } from "./../../model";

export interface IAuthService {
  generateToken: (username: string, role: string) => string;
  authorize: (req: Request, res: Response, next: NextFunction) => void;
  getUserByEmail(email: string): Promise<User[]>;
}

export class AuthService implements IAuthService {
  protected readonly repository: IRepository<User>;
  protected readonly childRepository: Repository<UserRole>;
  constructor(sequelize: Sequelize) {
    this.repository = new BaseRepository<User>(User, sequelize);
    this.childRepository = sequelize.getRepository(UserRole);
  }
  public readonly generateToken = (username: string, role: string): string => {
    return sign({ role }, environment.jwt.code, {
      expiresIn: "24h",
      audience: username,
      issuer: environment.jwt.issue,
      subject: environment.jwt.subject,
    });
  };

  public readonly getUserByEmail = (email: string): Promise<User[]> => {
    return this.repository.getAll({ Email: email }, []);
  };

  public readonly authorize = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Token is missing" });
    }
    try {
      const decoded = verify(token + "", environment.jwt.code, {
        issuer: environment.jwt.issue,
        subject: environment.jwt.subject,
      });
      const username = Object.assign(decoded.valueOf()).aud;
      let user = await this.repository.getById({ UserName: username }, [
        this.childRepository,
      ]);
      if (user) {
        if(! user.IsActive) 
            return res.status(401).json({ error: "Account is disabled" })
        req.headers.extra = JSON.stringify({ ...user.get() });
        req.params.userId = user.Id.toString();
        next();
      } else {
        return res.status(401).json({ error: "Account is not found" });
      }
    } catch (ex) {
      return res.status(401).json(ex);
    }
  };
}
