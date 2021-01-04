import { Policy } from './../model/policy';
import { Camera, CaseImage, DangerousCase, PolicyLevel } from "./../model";
import axios from "axios";
import { time } from "console";
import NodeCache from "node-cache";
import { Sequelize } from "sequelize-typescript";
import { DangerousCaseService } from "./entity/dangerous.case.service";
import { FrameQueue, Frame } from "./model/frame.queue";
import { FirebaseService } from ".";
import Moment from "Moment";
import { PolicyService } from "./entity";
import { Op } from "sequelize";
import { environment } from "../environment";
import { TRACKING_WEIRD_HOUR } from "../socket/hub.type";

export class DetectService {
  strangerQueue: any;
  knownPeopleQueue: any;
  prohibitedItemQueue: any;
  trackingFaceQueue: any;
  missingFaceQueue: any;
  dangerousCaseService: DangerousCaseService;
  policyService: PolicyService;
  sequelize: Sequelize;
  private readonly firebaseService: FirebaseService;
  constructor(sequelize: Sequelize) {
    this.strangerQueue = {};
    this.knownPeopleQueue = {};
    this.prohibitedItemQueue = {}; // maximum 50 frame stored
    this.missingFaceQueue = {};
    this.trackingFaceQueue = {};
    this.dangerousCaseService = new DangerousCaseService(sequelize);
    this.policyService = new PolicyService(sequelize);
    this.sequelize = sequelize;
    this.firebaseService = new FirebaseService();
  }
  public sendImageToDetectPersonLocationTiny(image: any) {
    return axios.post(
      `${environment.ai_endpoint}/detectobjectbase64tinylocation`,
      { image: image }
    );
  }

  public sendImageToDetectProhibitedItemLocation(image: any) {
    return axios.post(`${environment.ai_object_endpoint}/detectobject`, {
      image: image,
    });
  }


  public sendImageToDetectFaceLocation(image: any) {
    return axios.post(`${environment.ai_endpoint}/detectfacelocation`, {
      image: image,
    }, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
  }
  public sendImageToDetectMask(image: any) {
    return axios.post(`${environment.ai_mask_endpoint}/detectfacemask`, {
      image: image,
    });
  }
  public sendImageToDetectFaceLocationByBuilding(
    image: any,
    buildingId: Number
  ) {
    // detectfacelocationbybuilding
    return axios.post(
      `${environment.ai_endpoint}/detectfacelocationbybuilding`,
      { image: image, BuildingId: buildingId }
    );
  }
  detectStranger = async (camera: Camera, frame: Frame) => {
    //frame.FaceData = res.data.info;
    if (
      frame.FaceData.filter((e: any) => e.code.toLowerCase() === "unknown" || e.isActive == false)
        .length === 0
    )
      return;
    if (!this.strangerQueue[camera.Code])
      this.strangerQueue[camera.Code] = new FrameQueue(environment.detect_config.sizeQueue); // maximum 50 frames.

    if (
      this.strangerQueue[camera.Code].isEmpty() ||
      this.strangerQueue[camera.Code].lastElement() === undefined
    ) {
      this.strangerQueue[camera.Code].enqueue(frame);
      return;
    }
    let lastTime =
      this.strangerQueue[camera.Code].lastElement() || new Frame("");
    let timeCount = frame.date.getTime() - lastTime.date.getTime();
    if (timeCount > environment.detect_config.timeOut) {
      this.strangerQueue[camera.Code].clear();
    }
    this.strangerQueue[camera.Code].enqueue(frame);
    console.log('stranger detect length', this.strangerQueue[camera.Code].data.length)
    if (
      this.strangerQueue[camera.Code].data.length == environment.detect_config.strangerFrameThreshold
    ) {
      // create dangerous case
      //: D nho kiem tra lai xem policyId co chua nha!!!
      let policy = await this.policyService.getAll(
        { Name: { [Op.like]: "%Stranger%" } },
        [this.sequelize.getRepository(PolicyLevel)]
      );

      if (policy.length === 0) {
        throw new Error("No policy applied");
      }
      let dangerousCase = {
        IsDangerous: policy[0].PolicyLevel.Name.includes("Dangerous"),
        BuildingId: camera.Building.Id,
        CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
        CreatedByCamera: camera.Code,
        PolicyId: policy[0].Id,
        Policy: policy[0],
        // ProhibitedItemNames
        StudentUsernames: this.strangerQueue[camera.Code].data[0].people.concat(
          this.strangerQueue[camera.Code].data[4].people.concat(
            this.strangerQueue[camera.Code].data[6].people.concat(
              this.strangerQueue[camera.Code].data[8].people
            )
          )
        ),
        Images: [
          // {
          //   Image: Buffer.from(
          //     this.strangerQueue[camera.Code].data[0].image,
          //     "base64"
          //   ),
          //   FaceData: this.strangerQueue[camera.Code].data[0].FaceData,
          //   ProhibitedItemData: this.strangerQueue[camera.Code].data[0]
          //     .ProhibitedItemData,
          // },
          // {
          //   Image: Buffer.from(
          //     this.strangerQueue[camera.Code].data[1].image,
          //     "base64"
          //   ),
          //   FaceData: this.strangerQueue[camera.Code].data[1].FaceData,
          //   ProhibitedItemData: this.strangerQueue[camera.Code].data[1]
          //     .ProhibitedItemData,
          // },
          {
            Image: Buffer.from(
              this.strangerQueue[camera.Code].data[2].image,
              "base64"
            ),
            FaceData: this.strangerQueue[camera.Code].data[2].FaceData,
            ProhibitedItemData: this.strangerQueue[camera.Code].data[2]
              .ProhibitedItemData,
          },
          // {
          //   Image: Buffer.from(
          //     this.strangerQueue[camera.Code].data[3].image,
          //     "base64"
          //   ),
          //   FaceData: this.strangerQueue[camera.Code].data[3].FaceData,
          //   ProhibitedItemData: this.strangerQueue[camera.Code].data[3]
          //     .ProhibitedItemData,
          // },
          {
            Image: Buffer.from(
              this.strangerQueue[camera.Code].data[4].image,
              "base64"
            ),
            FaceData: this.strangerQueue[camera.Code].data[4].FaceData,
            ProhibitedItemData: this.strangerQueue[camera.Code].data[4]
              .ProhibitedItemData,
          },
          // {
          //   Image: Buffer.from(
          //     this.strangerQueue[camera.Code].data[5].image,
          //     "base64"
          //   ),
          //   FaceData: this.strangerQueue[camera.Code].data[5].FaceData,
          //   ProhibitedItemData: this.strangerQueue[camera.Code].data[5]
          //     .ProhibitedItemData,
          // },
          {
            Image: Buffer.from(
              this.strangerQueue[camera.Code].data[6].image,
              "base64"
            ),
            FaceData: this.strangerQueue[camera.Code].data[6].FaceData,
            ProhibitedItemData: this.strangerQueue[camera.Code].data[6]
              .ProhibitedItemData,
          },
          // {
          //   Image: Buffer.from(
          //     this.strangerQueue[camera.Code].data[7].image,
          //     "base64"
          //   ),
          //   FaceData: this.strangerQueue[camera.Code].data[7].FaceData,
          //   ProhibitedItemData: this.strangerQueue[camera.Code].data[7]
          //     .ProhibitedItemData,
          // },
          {
            Image: Buffer.from(
              this.strangerQueue[camera.Code].data[8].image,
              "base64"
            ),
            FaceData: this.strangerQueue[camera.Code].data[8].FaceData,
            ProhibitedItemData: this.strangerQueue[camera.Code].data[8]
              .ProhibitedItemData,
          },
          // {
          //   Image: Buffer.from(
          //     this.strangerQueue[camera.Code].data[9].image,
          //     "base64"
          //   ),
          //   FaceData: this.strangerQueue[camera.Code].data[9].FaceData,
          //   ProhibitedItemData: this.strangerQueue[camera.Code].data[9]
          //     .ProhibitedItemData,
          // },
        ],
        CaseHistories: [
          {
            Subject: "New",
            Content: `${policy[0].Description}  in ${camera.Position}, ${camera.Building.Location}`,
            CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
          },
        ],
      };
      this.dangerousCaseService
        .create(dangerousCase as any)
        .then((result) => { })
        .catch((e) => console.error(e));
    }
  };

  distance = (x: number, y: number, person: any) => {
    if (x < 0 || y < 0) return 9999;
    if (!person.x || !person.y) return 9999;
    return Math.sqrt(
      (person.x - x) * (person.x - x) + (person.y - y) * (person.y - y)
    );
  };

  trackingFace = (camera: Camera, frame: Frame) => {
    if (!this.trackingFaceQueue[camera.Code])
      this.trackingFaceQueue[camera.Code] = {};
    if (frame.FaceData.length === 0) return;
    let knownPeople: any[] = frame.FaceData.filter(
      (e: any) => e.code.toLowerCase() !== "unknown"
    );
    let now: Date = new Date();
    for (let e of knownPeople) {
      let x = (e.left + e.right) / 2;
      let y = (e.top + e.bottom) / 2;
      if (!this.trackingFaceQueue[camera.Code][e.code]) {
        this.trackingFaceQueue[camera.Code][e.code] = {};
        this.trackingFaceQueue[camera.Code][e.code].isActive = e.isActive;
        this.trackingFaceQueue[camera.Code][e.code].isRelative = e.isRelative;
        this.trackingFaceQueue[camera.Code][e.code].date = now;
        this.trackingFaceQueue[camera.Code][e.code].time = 1;
      }
      this.trackingFaceQueue[camera.Code][e.code].x = x;
      this.trackingFaceQueue[camera.Code][e.code].y = y;
      // 1000 mili s
      if (
        now.getTime() -
        this.trackingFaceQueue[camera.Code][e.code].date.getTime() >
        environment.detect_config.timeToTracking
      ) {
        this.trackingFaceQueue[camera.Code][e.code].date = now;
        this.trackingFaceQueue[camera.Code][e.code].time =
          this.trackingFaceQueue[camera.Code][e.code].time + 1;
        this.trackingFaceQueue[camera.Code][e.code].isActive = e.isActive;
        this.trackingFaceQueue[camera.Code][e.code].isRelative = e.isRelative;
      }
    }
    for (let e of frame.FaceData) {
      if (e.code.toLowerCase() !== "unknown") return;
      let x = (e.left + e.right) / 2;
      let y = (e.top + e.bottom) / 2;
      // for off
      let threshold = environment.detect_config.faceTrackingDistanceThreshold;
      let temp = null;
      let tempIsRelative = null;
      let tempIsActive = null;
      for (let knownPerson in this.trackingFaceQueue[camera.Code]) {
        if (
          now.getTime() -
          this.trackingFaceQueue[camera.Code][knownPerson].date.getTime() >
          environment.detect_config.timeToTracking ||
          now.getTime() -
          this.trackingFaceQueue[camera.Code][knownPerson].date.getTime() ==
          0 ||
          this.trackingFaceQueue[camera.Code][knownPerson].time < 2
        ) {
          continue;
        }
        let distance = this.distance(x, y, this.trackingFaceQueue[camera.Code][knownPerson]);
        if (distance < threshold && now.getTime()) {
          threshold = distance;
          temp = knownPerson;
          tempIsActive = this.trackingFaceQueue[camera.Code][knownPerson].isActive;
          tempIsRelative = this.trackingFaceQueue[camera.Code][knownPerson].isRelative;
        }
      }
      if (temp) {
        console.log("xanh 1 thang: ", temp, tempIsActive, tempIsRelative);
        let distance = this.distance(x, y, this.trackingFaceQueue[camera.Code][temp]);
        this.trackingFaceQueue[camera.Code][temp].date = now;
        this.trackingFaceQueue[camera.Code][temp].x = x;
        this.trackingFaceQueue[camera.Code][temp].y = y;
        this.trackingFaceQueue[camera.Code][temp].time =
          this.trackingFaceQueue[camera.Code][temp].time - 4;
        e.code = temp;
        e.isActive = tempIsActive;
        e.isRelative = tempIsRelative;
      }
    }
  };

  trackingWeirdHour = async (
    camera: Camera,
    frame: Frame,
    memCache: NodeCache
  ) => {
    if (
      frame.FaceData.filter((e: any) => e.code.toLowerCase() != "unknown")
        .length == 0
    )
      return;
    if (!this.knownPeopleQueue[camera.Code])
      this.knownPeopleQueue[camera.Code] = new FrameQueue(environment.detect_config.sizeQueue); // maximum environment.detect_config.sizeQueue frames.

    if (
      this.knownPeopleQueue[camera.Code].isEmpty() ||
      this.knownPeopleQueue[camera.Code].lastElement() === undefined
    ) {
      this.knownPeopleQueue[camera.Code].enqueue(frame);
      return;
    }
    let lastTime =
      this.knownPeopleQueue[camera.Code].lastElement() || new Frame("");
    let timeCount = frame.date.getTime() - lastTime.date.getTime();
    if (timeCount > environment.detect_config.timeOut) {
      this.knownPeopleQueue[camera.Code].clear();
    }
    this.knownPeopleQueue[camera.Code].enqueue(frame);
    console.log('weird hour detect frame', this.knownPeopleQueue[camera.Code].data.length)
    if (
      this.knownPeopleQueue[camera.Code].data.length == 6 &&
      !memCache.get(TRACKING_WEIRD_HOUR + camera.Code)
    ) {
      memCache.set(TRACKING_WEIRD_HOUR + camera.Code, true, 60); // 120 s
      let policy = await this.policyService.getAll(
        { Name: { [Op.like]: "%Weird hour%" } },
        [this.sequelize.getRepository(PolicyLevel)]
      );
      if (policy.length === 0) {
        throw new Error("No policy applied");
      }
      let dangerousCase = {
        IsDangerous: policy[0].PolicyLevel.Name.includes("Dangerous"),
        BuildingId: camera.Building.Id,
        // Code: `${camera.Building.Code}-${(Date.now() % 10000)}`,
        CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
        CreatedByCamera: camera.Code,
        PolicyId: policy[0].Id,
        Policy: policy[0],
        StudentUsernames: this.knownPeopleQueue[
          camera.Code
        ].data[0].people.concat(
          this.knownPeopleQueue[camera.Code].data[2].people.concat(
            this.knownPeopleQueue[camera.Code].data[3].people.concat(
              this.knownPeopleQueue[camera.Code].data[5].people
            )
          )
        ),
        Images: [
          {
            Image: Buffer.from(
              this.knownPeopleQueue[camera.Code].data[0].image,
              "base64"
            ),
            FaceData: this.knownPeopleQueue[camera.Code].data[0].FaceData,
            BodyData: this.knownPeopleQueue[camera.Code].data[0].BodyData,
          },
          {
            Image: Buffer.from(
              this.knownPeopleQueue[camera.Code].data[2].image,
              "base64"
            ),
            FaceData: this.knownPeopleQueue[camera.Code].data[2].FaceData,
            BodyData: this.knownPeopleQueue[camera.Code].data[2].BodyData,
          },
          {
            Image: Buffer.from(
              this.knownPeopleQueue[camera.Code].data[3].image,
              "base64"
            ),
            FaceData: this.knownPeopleQueue[camera.Code].data[3].FaceData,
            BodyData: this.knownPeopleQueue[camera.Code].data[3].BodyData,
          },
          {
            Image: Buffer.from(
              this.knownPeopleQueue[camera.Code].data[5].image,
              "base64"
            ),
            FaceData: this.knownPeopleQueue[camera.Code].data[5].FaceData,
            BodyData: this.knownPeopleQueue[camera.Code].data[5].BodyData,
          },
        ],
        CaseHistories: [
          {
            Subject: "New",
            Content: `${policy[0].Description}  in ${camera.Position}, ${camera.Building.Location}.`,
            CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
          },
        ],
      };
      this.dangerousCaseService
        .create(dangerousCase as any)
        .then((result) => {
          this.knownPeopleQueue[camera.Code].clear();
        })
        .catch((e) => console.error(e));
    }
  };

  detectMissingFaces = async (camera: Camera, frame: Frame) => {
    if (!this.missingFaceQueue[camera.Code])
      this.missingFaceQueue[camera.Code] = new FrameQueue(environment.detect_config.sizeQueue); // maximum environment.detect_config.sizeQueue frames.

    let lastTime =
      this.missingFaceQueue[camera.Code].lastElement() || new Frame("");
    let timeCount = frame.date.getTime() - lastTime.date.getTime();
    if (timeCount > environment.detect_config.timeOut) {
      this.missingFaceQueue[camera.Code].clear();
    }
    // số lượng body > số lượng face và có detect ra face -> dự đoán người che người.
    if (
      frame.BodyData.length > frame.FaceData.length &&
      frame.BodyData.length === 1
    ) {
      if (
        this.missingFaceQueue[camera.Code].isEmpty() ||
        this.missingFaceQueue[camera.Code].lastElement() === undefined
      ) {
        this.missingFaceQueue[camera.Code].enqueue(frame);
        return;
      }
      this.missingFaceQueue[camera.Code].enqueue(frame);

    }
    // số lượng body == số lượng face -> " người che người " đã đi ra khỏi camera.
    console.log('missing face queue', this.missingFaceQueue[camera.Code].size())
    if (
      this.missingFaceQueue[camera.Code].size() >= 10 &&
      frame.BodyData.length === 0
    ) {
      let policy = await this.policyService.getAll(
        { Name: { [Op.like]: "%Missing Face%" } },
        [this.sequelize.getRepository(PolicyLevel)]
      );
      if (policy.length === 0) {
        throw new Error("No policy applied");
      }

      let dangerousCase = {
        IsDangerous: policy[0].PolicyLevel.Name.includes("Dangerous"),
        BuildingId: camera.Building.Id,
        // Code: `${camera.Building.Code}-${(Date.now() % 10000)}`,

        CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
        CreatedByCamera: camera.Code,
        PolicyId: policy[0].Id,
        Policy: policy[0],
        StudentUsernames: this.missingFaceQueue[
          camera.Code
        ].data[0].people.concat(
          this.missingFaceQueue[camera.Code].data[2].people.concat(
            this.missingFaceQueue[camera.Code].data[4].people.concat(
              this.missingFaceQueue[camera.Code].data[6].people
            )
          )
        ),
        Images: [
          {
            Image: Buffer.from(
              this.missingFaceQueue[camera.Code].data[2].image,
              "base64"
            ),
            FaceData: this.missingFaceQueue[camera.Code].data[2].FaceData,
            BodyData: this.missingFaceQueue[camera.Code].data[2].BodyData,
          },
          {
            Image: Buffer.from(
              this.missingFaceQueue[camera.Code].data[4].image,
              "base64"
            ),
            FaceData: this.missingFaceQueue[camera.Code].data[4].FaceData,
            BodyData: this.missingFaceQueue[camera.Code].data[4].BodyData,
          },
          {
            Image: Buffer.from(
              this.missingFaceQueue[camera.Code].data[6].image,
              "base64"
            ),
            FaceData: this.missingFaceQueue[camera.Code].data[6].FaceData,
            BodyData: this.missingFaceQueue[camera.Code].data[6].BodyData,
          },
          {
            Image: Buffer.from(
              this.missingFaceQueue[camera.Code].data[8].image,
              "base64"
            ),
            FaceData: this.missingFaceQueue[camera.Code].data[8].FaceData,
            BodyData: this.missingFaceQueue[camera.Code].data[8].BodyData,
          },
        ],
        CaseHistories: [
          {
            Subject: "New missing face detected",
            Content: `${policy[0].Description} in ${camera.Position}, ${camera.Building.Location}.`,
            CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
          },
        ],
      };
      this.missingFaceQueue[camera.Code].clear();
      this.dangerousCaseService
        .create(dangerousCase as any)
        .then((result) => { })
        .catch((e) => console.error(e));
    }
  };

  detectProhibitedItem = async (camera: Camera, frame: Frame) => {
    // ko detect ra body
    if (!frame.ProhibitedItemData || frame.ProhibitedItemData.length == 0)
      return;
    if (!this.prohibitedItemQueue[camera.Code])
      this.prohibitedItemQueue[camera.Code] = new FrameQueue(environment.detect_config.sizeQueue); // maximum environment.detect_config.sizeQueue frames.
    let lastTime =
      this.prohibitedItemQueue[camera.Code].lastElement() || new Frame("");
    let timeCount = frame.date.getTime() - lastTime.date.getTime();
    if (timeCount > environment.detect_config.timeOutItem) {
      this.prohibitedItemQueue[camera.Code].clear();
    }
    this.prohibitedItemQueue[camera.Code].enqueue(frame);
    console.log('prohibited item detect frame', this.prohibitedItemQueue[camera.Code].data.length)
    if (
      this.prohibitedItemQueue[camera.Code].data.length ==
      environment.detect_config.itemFrameThreshold
    ) {
      let policy = await this.policyService.getAll(
        { Name: { [Op.like]: "%Prohibited Item%" } },
        [this.sequelize.getRepository(PolicyLevel)]
      );
      if (policy.length === 0) {
        throw new Error("No policy applied");
      }

      let dangerousCase = {
        IsDangerous: policy[0].PolicyLevel.Name.includes("Dangerous"),
        BuildingId: camera.Building.Id,
        // Code: `${camera.Building.Code}-${(Date.now() % 10000)}`,

        CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
        CreatedByCamera: camera.Code,
        PolicyId: policy[0].Id,
        Policy: policy[0],
        StudentUsernames: this.prohibitedItemQueue[camera.Code].data[2].people.concat(
          this.prohibitedItemQueue[camera.Code].data[4].people.concat(
            this.prohibitedItemQueue[camera.Code].data[6].people.concat(
              this.prohibitedItemQueue[camera.Code].data[8].people
            )
          )
        ),
        Images: [
          {
            Image: Buffer.from(
              this.prohibitedItemQueue[camera.Code].data[2].image,
              "base64"
            ),
            FaceData: this.prohibitedItemQueue[camera.Code].data[2].FaceData,
            ProhibitedItemData: this.prohibitedItemQueue[camera.Code].data[2]
              .ProhibitedItemData,
          },
          {
            Image: Buffer.from(
              this.prohibitedItemQueue[camera.Code].data[4].image,
              "base64"
            ),
            FaceData: this.prohibitedItemQueue[camera.Code].data[4].FaceData,
            ProhibitedItemData: this.prohibitedItemQueue[camera.Code].data[4]
              .ProhibitedItemData,
          },
          {
            Image: Buffer.from(
              this.prohibitedItemQueue[camera.Code].data[6].image,
              "base64"
            ),
            FaceData: this.prohibitedItemQueue[camera.Code].data[6].FaceData,
            ProhibitedItemData: this.prohibitedItemQueue[camera.Code].data[6]
              .ProhibitedItemData,
          },
          {
            Image: Buffer.from(
              this.prohibitedItemQueue[camera.Code].data[8].image,
              "base64"
            ),
            FaceData: this.prohibitedItemQueue[camera.Code].data[8].FaceData,
            ProhibitedItemData: this.prohibitedItemQueue[camera.Code].data[8]
              .ProhibitedItemData,
          },
          // {
          //   Image: Buffer.from(
          //     this.prohibitedItemQueue[camera.Code].data[10].image,
          //     "base64"
          //   ),
          //   FaceData: this.prohibitedItemQueue[camera.Code].data[10].FaceData,
          //   ProhibitedItemData: this.prohibitedItemQueue[camera.Code].data[10]
          //     .ProhibitedItemData,
          // },
        ],
        CaseHistories: [
          {
            Subject: "New",
            Content: `${policy[0].Description} in ${camera.Position},${camera.Building.Location}.`,
            CreatedBy: `Camera: ${camera.Code}, Building ${camera.Building.Code}`,
          },
        ],
        ProhibitedItemNames: frame.ProhibitedItemData.map((e: any) => e.Code),
      };

      this.dangerousCaseService
        .create(dangerousCase as any)
        .then((result) => { })
        .catch((e) => console.error(e));
    }
  };

  base64ToFile = async (imageBase64: string) => {
    require("fs").writeFile(
      "raw-images/knife-" + Moment().toISOString().replace("-", "") + ".jpg",
      imageBase64,
      "base64",
      function (err: any) {
        console.log(err);
      }
    );
  };

  //#region Draw by data
  drawFaces = (img: any, faces: any[]) => {
    if (!faces || faces.length === 0) return;
    let isUnKnown = false;
    faces.forEach((face) => {
      let _color = environment.detect_config.colors.green;
      if (face.code.toLowerCase() === "unknown" || face.code.toLowerCase() == 'no_mask') {
        _color = environment.detect_config.colors.red;
        isUnKnown = true;
      }
      if (face.isRelative) {
        _color = face.isActive ? environment.detect_config.colors.yellow : environment.detect_config.colors.red;
      } else if (face.isActive == false) {
        _color = environment.detect_config.colors.purple;
      }
      face.left = face.left - 5;
      face.top = face.top - 5;
      face.right = face.right + 10;
      face.bottom = face.bottom + 10;
      img
        .stroke(_color, 2)
        .drawLine(face.left, face.top, face.left, face.bottom)
        .drawLine(face.left, face.top, face.right, face.top)
        .drawLine(face.right, face.top, face.right, face.bottom)
        .drawLine(face.left, face.bottom, face.right, face.bottom)
        .stroke(_color, 20)
        .drawLine(face.left, face.bottom, face.right, face.bottom)
        .fill("#ffffff")
        .stroke("white", 1)
        .font("Arial", 16)
        .drawText(face.left + 10, face.bottom + 5, face.code);
    });
    if (isUnKnown) {
      img.borderColor(environment.detect_config.colors.light_red).border(5, 5);
    }
  };

  //#region Draw by data
  drawFps = (img: any, fps: number) => {
    let _color = environment.detect_config.colors.dark_blue;

    img
      .stroke(_color, 2)
      .font("Arial", 14)
      .drawText(400 + 10, 15, `${1000 / fps}`.split('.')[0] + " FPS");
  };

  drawBody = (img: any, objs: any[]) => {
    if (!objs || objs.length === 0) return;
    let _color = environment.detect_config.colors.yellow;
    objs.forEach((obj) => {
      obj.left = obj.left - 5;
      obj.top = obj.top - 5;
      obj.right = obj.right + 10;
      obj.bottom = obj.bottom + 10;
      img
        .stroke(_color, 2)
        .drawLine(obj.left, obj.top, obj.left, obj.bottom)
        .drawLine(obj.left, obj.top, obj.right, obj.top)
        .drawLine(obj.right, obj.top, obj.right, obj.bottom)
        .drawLine(obj.left, obj.bottom, obj.right, obj.bottom)
        .fill("#ffffff")
        .stroke("white", 1)
        .font("Arial", 16)
        .drawText(obj.left + 10, obj.top + 5, obj.code);
    });
  };
  drawItem = (img: any, objs: any[]) => {
    if (!objs || objs.length === 0) return;
    let _color = environment.detect_config.colors.light_red;
    img.borderColor(_color).border(5, 5);
    objs.forEach((obj) => {
      obj.left = obj.left - 5;
      obj.top = obj.top - 5;
      obj.right = obj.right + 10;
      obj.bottom = obj.bottom + 10;
      img
        .stroke(_color, 2)
        .drawLine(obj.left, obj.top, obj.left, obj.bottom)
        .drawLine(obj.left, obj.top, obj.right, obj.top)
        .drawLine(obj.right, obj.top, obj.right, obj.bottom)
        .drawLine(obj.left, obj.bottom, obj.right, obj.bottom)
        .stroke(_color, 20)
        .drawLine(obj.left, obj.top, obj.right, obj.top)
        .fill("#ffffff")
        .stroke("white", 1)
        .font("Arial", 16)
        .drawText(obj.left + 10, obj.top + 5, obj.code);
    });
  };
  //#endregion
}
