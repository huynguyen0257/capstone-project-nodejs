import { Sequelize } from "sequelize-typescript";
import {
  Building,
  Camera,
  CaseHistory,
  CaseHistoryStatus,
  CaseHistoryStatusFamily,
  Configuration,
  DangerousCase,
  DeviceToken,
  ENTITIES,
  Policy,
  PolicyLevel,
  ProhibitedItem,
  Role,
  Room,
  SecurityMan,
  Student,
  University,
  User,
  UserRole,
} from "./../model";
import { environment } from "./../environment";
import { hashSync } from "bcrypt";
import { WEIRD_HOURS_CONFIG } from '../socket/hub.type';

export class DbContext {
  sequelize: Sequelize;

  constructor() {
    const config: any = {
      username: environment.database.username,
      password: environment.database.password,
      database: environment.database.databaseName,
      host: environment.database.host,
      dialect: environment.database.dialect,
      operatorsAliases: environment.database.operatorsAliases,
    };
    this.sequelize = new Sequelize({
      logging: false,
      models: [...ENTITIES],
      ...config,
      dialect: config.dialect,
      host: config.host,
      name: config.database,
      password: config.password,
      pool: {
        // connectionLimit: 1000,
        // acquire: 300000000,
        // idle: 100000000,
        max: 1000,
        min: 0,
      },
      repositoryMode: true,
      username: config.username,
      validateOnly: false,
      operatorsAliases: config.operatorsAliases,
      options: {
        encrypt: true,
        enableArithAbort: true,
      },
      dialectOptions: {
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      },
    });
  }

  public async connection(force = false) {
    console.log("force: " + force);
    await this.sequelize
      .sync({
        force: force,
      })
      .then(() => {
        console.log("Connection has been established successfully.");
      })
      .catch((e) => {
        console.error("Unable to connect to the database:", e);
      });
  }

  public async seed() {
    const users = await this.sequelize
      .getRepository(User)
      .findAll({ where: { Username: "xhunter1412@gmail.com" }, include: [] });
    // seed
    if (users.length == 0) {
      // ROLE
      const manager_role = await this.sequelize
        .getRepository(Role)
        .create({ Name: "Manager" });
      const building_guard_role = await this.sequelize.getRepository(Role).create({ Name: "Building Guard" });
      this.sequelize.getRepository(Role).create({ Name: "Area Guard" });
      const student_role = await this.sequelize
        .getRepository(Role)
        .create({ Name: "Student" });

      // USER
      const admin = await this.sequelize.getRepository(User).create({
        Username: "admin@gmail.com",
        FullName: "Admin",
        Password: hashSync("123456", 10),
        Email: "admin@gmail.com",
        Phone: "0123456789",
        Gender: true,
        BirthDate: null,
      });
      
      // USER ROLE
      this.sequelize
        .getRepository(UserRole)
        .create({ UserId: admin.Id, RoleId: manager_role.Id });
      this.sequelize
        .getRepository(SecurityMan)
        .create({ UserId: admin.Id, Code: "SCM-01", IsOnline: true });
      
      const prohibitedItem = await this.sequelize
        .getRepository(ProhibitedItem)
        .create({ Name: "Knife" });

      //CaseHistoryStatus
      const pending = await this.sequelize
        .getRepository(CaseHistoryStatus)
        .create({ Name: "Pending", Order: 0 ,Image: "https://firebasestorage.googleapis.com/v0/b/sdms-captone-4ab5b.appspot.com/o/process-image%2Fpending.png?alt=media&token=fa4de0ef-80f3-4bf2-b9ff-800d63258bd5"});
      // const approve = await this.sequelize
      //   .getRepository(CaseHistoryStatus)
      //   .create({ Name: "Approving", Order: 3 ,Image: "https://firebasestorage.googleapis.com/v0/b/sdms-captone-4ab5b.appspot.com/o/process-image%2Fconsidering.png?alt=media&token=1ffada6c-c253-41dd-b860-19e0ea0abde2" });
      const deny = await this.sequelize
        .getRepository(CaseHistoryStatus)
        .create({ Name: "Rejection", Order: 3 ,Image: "https://firebasestorage.googleapis.com/v0/b/sdms-captone-4ab5b.appspot.com/o/process-image%2Frejection.png?alt=media&token=a004b778-5672-436c-a6e1-7b5fb9899424" });
      const processing = await this.sequelize
        .getRepository(CaseHistoryStatus)
        .create({ Name: "Processing", Order: 10 ,Image: "https://firebasestorage.googleapis.com/v0/b/sdms-captone-4ab5b.appspot.com/o/process-image%2Fprocessing.png?alt=media&token=727b6c19-5340-4cda-a4e6-a144fdcfd69b" });
      // const skip = await this.sequelize
      //   .getRepository(CaseHistoryStatus)
      //   .create({ Name: "Skipping", Order: 10 ,Image: "https://firebasestorage.googleapis.com/v0/b/sdms-captone-4ab5b.appspot.com/o/process-image%2Fskipping.png?alt=media&token=07797d98-c311-49d0-a0ee-ce68d8e0bebd" });
      // const success = await this.sequelize
      //   .getRepository(CaseHistoryStatus)
      //   .create({ Name: "Saving", Order: 15 ,Image: "https://firebasestorage.googleapis.com/v0/b/sdms-captone-4ab5b.appspot.com/o/process-image%2Fsaving.png?alt=media&token=c95ef99f-6a3a-409a-9fbc-626c5fc38cdc" });
      // await this.sequelize
      //   .getRepository(CaseHistoryStatus)
      //   .create({ Name: "Fail", Order: 15 });
      const close = await this.sequelize
        .getRepository(CaseHistoryStatus)
        .create({ Name: "Close", Order: 20 ,Image: "https://firebasestorage.googleapis.com/v0/b/sdms-captone-4ab5b.appspot.com/o/process-image%2Fclose.png?alt=media&token=7ed8adb1-687b-4e46-b6c3-7b48fea398da" });

      //CaseHistoryStatusFamily
      await this.sequelize
        .getRepository(CaseHistoryStatusFamily)
        .create({ CaseHistoryStatusId: pending.Id, ParentId: deny.Id });
      await this.sequelize
        .getRepository(CaseHistoryStatusFamily)
        .create({ CaseHistoryStatusId: pending.Id, ParentId: processing.Id });
        await this.sequelize
        .getRepository(CaseHistoryStatusFamily)
        .create({ CaseHistoryStatusId: processing.Id, ParentId: close.Id });
        // await this.sequelize
        // .getRepository(CaseHistoryStatusFamily)
        // .create({ CaseHistoryStatusId: approve.Id, ParentId: skip.Id });
        // await this.sequelize
        // .getRepository(CaseHistoryStatusFamily)
        // .create({ CaseHistoryStatusId: approve.Id, ParentId: processing.Id });
        // await this.sequelize
        // .getRepository(CaseHistoryStatusFamily)
        // .create({ CaseHistoryStatusId: skip.Id, ParentId: close.Id });
        // await this.sequelize
        // .getRepository(CaseHistoryStatusFamily)
        // .create({ CaseHistoryStatusId: processing.Id, ParentId: success.Id });
        // await this.sequelize
        // .getRepository(CaseHistoryStatusFamily)
        // .create({ CaseHistoryStatusId: success.Id, ParentId: close.Id });
        

      const dangerousLevel = await this.sequelize
        .getRepository(PolicyLevel)
        .create({ Name: "Dangerous", Level: 10, Color: "red" });
      const warningLevel = await this.sequelize
        .getRepository(PolicyLevel)
        .create({ Name: "Warning", Level: 0, Color: "yellow" });
      await this.sequelize.getRepository(Policy).create({
        Name: "Stranger detected",
        Code: "SDC-01",
        Type: 1,
        Description: "Discovered strangers in dormitory",
        Fine: "Camera an ninh ghi nhận trường hợp có người lạ ( bao gồm sinh viên cũ hoặc nhân viên cũ không còn hoạt động tại KTX) có hành vi di chuyển trong khuôn viên KTX ",
        Color: "#FF5964",
        PolicyLevelId: dangerousLevel.Id,
      });
      await this.sequelize.getRepository(Policy).create({
        Name: "Prohibited Item detected",
        Code: "PID-01",
        Type: 5,
        Description: "Camera an ninh ghi nhận trường hợp khả nghi có người đem vật nguy hiểm sắc nhọn ( dao, kéo) vào khuôn viên KTX ",
        Fine: "1 report",
        Color: "#DE4F3F",
        PolicyLevelId: dangerousLevel.Id,
      });
      await this.sequelize.getRepository(Policy).create({
        Name: "Missing Face detected",
        Code: "MFD-02",
        Type: 2,
        Description: "Camera an ninh ghi nhận trường hợp che khuất khuôn mặt trong quá trình ra vào KTX",
        Fine: "Manual detect again",
        Color: "#E4572E8d",
        PolicyLevelId: dangerousLevel.Id,
      });
      await this.sequelize.getRepository(Policy).create({
        Name: "Weird hour detected",
        Code: "WHD-02",
        Type: 3,
        Description: "Discovered student go in weird hour in the hallway",
        Fine: "Camera an ninh ghi nhận sinh viên di chuyển tại hành lang trong khung giờ không cho phép",
        Color: "#E09F3E",
        PolicyLevelId: warningLevel.Id,
      });
      await this.sequelize.getRepository(Policy).create({
        Name: "Old student detected",
        Code: "OSD-01",
        Type: 4,
        Description: "Camera an ninh ghi nhận trường hợp có sinh viên cũ hoặc nhân viên cũ không còn hoạt động tại KTX di chuyển trong khuôn viên KTX ",
        Fine: "Invited out of dorm",
        Color: "#DAA49A",
        PolicyLevelId: warningLevel.Id,
      });
      
      const manualPolicy = await this.sequelize.getRepository(Policy).create({
        Name: "Manual detected",
        Code: "MD-01",
        Type: 6,
        Description: "Manual detected by manager",
        Fine: "Nhân viên trực cam tại sảnh phát hiện hành vi đáng ngờ",
        Color: "#FF8C42",
        PolicyLevelId: dangerousLevel.Id,
      });
      await this.sequelize.getRepository(Policy).create({
        Name: "Mobile detected",
        Code: "MD-02",
        Type: 7,
        Description: "Nhân viên tuần tra khuôn viên hoặc sinh viên tại sảnh phát hiện hành vi đáng ngờ tại khuôn viên KTX",
        Fine: "Manager check again",
        Color: "#E0C200",
        PolicyLevelId: dangerousLevel.Id,
      });
      // await this.sequelize
      //   .getRepository(Camera)
      //   .create({ RtspLink: "10.32.23", Type: 1, Code: "C01", Username: "admin",Password: "123Password", BuildingId: 1, SocketId: 'DEV'});
      this.sequelize.getRepository(Configuration).create({ Key: WEIRD_HOURS_CONFIG, Value: JSON.stringify({ startHour: 23, endHour: 5 }) })
      // CONFIGURATION
      this.sequelize
        .getRepository(Configuration)
        .create({ Key: "1A", Value: "At school" });
      this.sequelize
        .getRepository(Configuration)
        .create({ Key: "1C", Value: "School" });
      const building = await this.sequelize.getRepository(Building).create({Code:'B20', Location:'demo',NumberOfFloor:1,NumberOfRoom:1, NumberOfStudent:1, Longitude:'1', Latitude:'2', CreatedBy:'dev', })

      let code = 1;
      const arr = [8,14,26,18,15,12,17,16,19,7,14,1]
      for( let i =0 ; i < arr.length; i++) {
        for(let j = 0; j < arr[i];j++) {
          const _case = await this.sequelize
          .getRepository(DangerousCase)
          .create({ Code:  '000'+ code, Location:'dev', CreatedBy:'dev', UpdatedBy:'dev', UpdatedAt: new Date(new Date().setMonth(i)), CreatedAt: new Date(new Date().setMonth(i)), PolicyId: (Math.floor(Math.random() * Math.floor(9))%7)+1, CurrentStatusId:close.Id,BuildingId: building.Id});
          code = code +1;
          this.sequelize.getRepository(CaseHistory).create({Subject:'OK', StatusId: close.Id, CaseId: _case.Id})
        }
      }
      const camera = await this.sequelize.getRepository(Camera).create({Code:'B20', Position:'demo',RtspLink:'1',Type:0, Status:1, Username:'1', Password:'2', SocketId:'dev', BuildingId:  building.Id })
    }
  }

  public async disconnect() {
    await this.sequelize
      .close()
      .then(() => {
        console.log("Connection has been close successfully.");
      })
      .catch((e) => {
        console.error("Unable to close to the database:", e);
      });
  }
}
