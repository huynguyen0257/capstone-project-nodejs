import { DetectService, FirebaseService, Frame } from "./../service";
import fs from "fs";
import NodeCache from "node-cache";
import path from "path";
import { environment } from "../environment";
import { classToClass, plainToClass } from "class-transformer";
import { Sequelize } from "sequelize-typescript";
import gm from 'gm'
gm.subClass({ imageMagick: true });
import { CameraService, ConfigurationService } from "../service/entity";
import { Building, Camera } from "../model";
import { NO_MASK_KEY, FRAME_KEY, FACE_DATA_KEY,FRAME_TIME_KEY, FACE_REGISTER_ENHANCER, READY, RUNNING, BODY_DATA_KEY, ITEM_DATA_KEY, WEIRD_HOURS_CONFIG, INFO_CAMERA_LIST } from "../socket/hub.type"
import console from "console";
var faceDetect = true;
var tinyDetect = false;
var prohibitedItemDetect = false;
var tracking = true;
var weirdHour = false;
var saveImage = false;
var saveFaceImage = false;
var sendNoti = false;
var buildingDetect = false;
var maskDetect = false;
var weirdHourConfigDefault = { startHour: 23, endHour: 5 }
export class SocketHub {
  private fps = 12;
  private io: SocketIO.Server;
  private socket: SocketIO.Socket;
  private memCache: NodeCache;
  private cameraService: CameraService;
  private streamProcesses: any = {};
  private streamEnhanceProcesses: any = {};
  // private camerasInfo: Camera[] = []

  private detectServices: DetectService;
  private firebaseService: FirebaseService;
  private readonly configurationService: ConfigurationService;
  constructor(
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    memCache: NodeCache,
    sequelize: Sequelize
  ) {
    this.io = io;
    this.socket = socket;
    this.memCache = memCache;
    this.cameraService = new CameraService(sequelize);
    this.detectServices = new DetectService(sequelize);
    this.firebaseService = new FirebaseService();
    this.configurationService = new ConfigurationService(sequelize);
    this.cameraService.getAll({}, [sequelize.getRepository(Building)]).then(list => {
      let data = list.map(e => {
        return {
          Id: e.Id,
          Position: e.Position,
          Code: e.Code,
          Building: {
            Id: e.Building.Id,
            Code: e.Building.Code,
            Location: e.Building.Location
          }
        }
      })
      this.memCache.set(INFO_CAMERA_LIST, data)
    })

    this.memCache.set(
      FRAME_KEY + "C01",
      environment.images.sample_detection
    );
    this.configurationService.getById({ Key: WEIRD_HOURS_CONFIG }, []).then(res => {
      if (!res) { this.memCache.set(WEIRD_HOURS_CONFIG, weirdHourConfigDefault); return; }
      this.memCache.set(WEIRD_HOURS_CONFIG, JSON.parse(res.Value))
    }).catch(err => {
      this.memCache.set(WEIRD_HOURS_CONFIG, weirdHourConfigDefault)
    })
  }

  private sendStatus = () => {
    this.io.emit('receiveStreamingStatus', {
      saveImage: saveImage,
      faceDetect: faceDetect,
      tinyDetect: tinyDetect,
      tracking: tracking,
      weirdHour: weirdHour,
      prohibitedItemDetect: prohibitedItemDetect,
      sendNoti: sendNoti,
      buildingDetect: buildingDetect,
      maskDetect: maskDetect,
    });
  }
  public settings = () => {
    this.socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
    console.log(this.socket.id)

    this.app_opening();
    this.app_register_face();
    this.web_opening();
    this.web_closing();
    this.socket.on('getStreamingStatus', () => {
      this.sendStatus()
    });

    this.io.emit('reUpdateCameraSocketId')

    this.socket.on('toggleSaveImage', () => {
      saveImage = !saveImage;
      this.sendStatus()
    });
    this.socket.on('toggleSaveFaceImage', () => {
      saveFaceImage = !saveFaceImage;
      this.sendStatus()
    });
    this.socket.on('resetFaceImageCache', () => {
      this.memCache.set(FACE_REGISTER_ENHANCER, []);
    });
    this.socket.on('toggleFaceDetect', () => {
      faceDetect = !faceDetect;
      if(faceDetect) {
        maskDetect = false;
        tracking = true;
      }
      this.sendStatus()
    });
    this.socket.on('toggleTinyDetect', () => {
      tinyDetect = !tinyDetect;
      if(tinyDetect) {
        faceDetect = true;
        tracking = true;
      }
      this.sendStatus()
    });
    this.socket.on('toggleTracking', () => {
      tracking = !tracking;
      this.sendStatus()
    });
    this.socket.on('toggleWeirdHour', () => {
      weirdHour = !weirdHour;
      if(weirdHour) {
        faceDetect = true;
        tracking = true;
      }
      this.sendStatus()
    });
    this.socket.on('toggleProhibitedItemDetect', () => {
      prohibitedItemDetect = !prohibitedItemDetect;
      this.sendStatus()
    });
    this.socket.on('toggleSendNoti', () => {
      sendNoti = !sendNoti;
      this.sendStatus()
    });
    this.socket.on('toggleBuildingDetect', () => {
      buildingDetect = !buildingDetect;
      this.sendStatus()
    });
   
    this.socket.on('toggleMaskDetect', () => {
      maskDetect = !maskDetect;
      if(maskDetect) {
        faceDetect = false;
        sendNoti = false;
        tracking = false;
        weirdHour = false;
      }
      this.sendStatus()
    });
    this.web_register_face_enhance()
  };
//data camera duoc gui len function nay
  app_opening = () => {
    // get stream data from app desktop
    this.socket.on("app_opening", async (image, camera_code, callback) => {
      let start = new Date()
      let cam = (this.memCache.get(INFO_CAMERA_LIST) as Camera[]).filter(c => c.Code === camera_code)[0];
      let now = Date.now();

      try {
        const frame = new Frame(image)
        frame.date = new Date(now);
        if(maskDetect && !sendNoti && !faceDetect) {
          let res = await this.detectServices.sendImageToDetectMask(image);
          // console.log(`Mask detect res:`)
          // console.log(res.data.info)
          // frame.people = res.data.objects;
          frame.people = res.data.people;
          frame.FaceData = res.data.info;
        }
        if (faceDetect) {
          if(buildingDetect) {
            let res = await this.detectServices.sendImageToDetectFaceLocationByBuilding(image, cam.Building.Id);
            frame.people = res.data.people;
            frame.FaceData = res.data.info;
          } else {
            let res = await this.detectServices.sendImageToDetectFaceLocation(image);
            frame.people = res.data.people;
            frame.FaceData = res.data.info;
          }
          if (tracking) {
            await this.detectServices.trackingFace(cam, frame);
          }
        }
        if (tinyDetect) {
          let res = await this.detectServices.sendImageToDetectPersonLocationTiny(image);
          frame.BodyData = res.data.info;
        }
        if (prohibitedItemDetect) {
          let res = await this.detectServices.sendImageToDetectProhibitedItemLocation(image);
          frame.ProhibitedItemData = res.data.info;
        }
        if (faceDetect) {
          this.memCache.set(FACE_DATA_KEY + camera_code, frame.FaceData);
          if (sendNoti) {
            await this.detectServices.detectStranger(cam, frame)
            if (weirdHour) {
              let config: any = this.memCache.get(WEIRD_HOURS_CONFIG)
              let now = frame.date.getHours()

              if ((config.startHour > config.endHour && (config.startHour <= now || now <= config.endHour))
                || (config.startHour < config.endHour && (config.startHour <= now && now <= config.endHour))
              ) {
                await this.detectServices.trackingWeirdHour(cam, frame, this.memCache);
              }
            }
          }
        } else {
          if(maskDetect) {
            this.memCache.set(FACE_DATA_KEY + camera_code, frame.FaceData);
            if(frame.FaceData && frame.FaceData.filter((e: any) => e.code.toLowerCase() =='no_mask').length > 0){
              this.memCache.set(NO_MASK_KEY + camera_code, true);
            }
          } else {
            this.memCache.set(FACE_DATA_KEY + camera_code, null);
          }
        }

        if (tinyDetect) {
          this.memCache.set(BODY_DATA_KEY + camera_code, frame.BodyData);
          if (sendNoti && tinyDetect && faceDetect) {
            this.detectServices.detectMissingFaces(cam, frame)
          }
        }
        else {
          this.memCache.set(BODY_DATA_KEY + camera_code, null);
        }
        if (prohibitedItemDetect) {
          this.memCache.set(ITEM_DATA_KEY + camera_code, frame.ProhibitedItemData);
          if (sendNoti) {
            this.detectServices.detectProhibitedItem(cam, frame)
          }
        }
        else {
          this.memCache.set(ITEM_DATA_KEY + camera_code, null);
        }
        this.memCache.set(FRAME_KEY + camera_code, image);
        // Lam xong xoa
        // if (saveImage){
        //   console.log("this.detectServices.base64ToFile(image);")
        //   this.detectServices.base64ToFile(image);
        // }
        this.memCache.set(FRAME_TIME_KEY + camera_code, new Date().getTime() - start.getTime());
        callback();
      } catch (e) {
        console.log('DETECT ERROR', e.message);
        this.memCache.set(FRAME_KEY + camera_code, image);
        callback();
      }
    });
  };
//capture buoc record face
  app_register_face = () => {
    this.socket.on("app_register_face", async (image, camera_code, callback) => {
      let res = await this.detectServices.sendImageToDetectFaceLocation(image);
      this.io.emit('takeFaceEnhanceImage', image, camera_code)
      if (res.data.info.length === 1) {
        console.log("this.detectServices.base64ToFile(image);")
        let images = this.memCache.get(FACE_REGISTER_ENHANCER);
        if (!images) images = [];
        (images as Array<any>).push({image:image, info: res.data.info[0]});
        this.memCache.set(FACE_REGISTER_ENHANCER, images);
      }
      callback();
    });
  }
//gui len FE step record b1
  web_register_face_enhance = () => {
    this.socket.on("openStreamEnhance", (callback) => {
      this.memCache.set(FACE_REGISTER_ENHANCER, []);
      this.io.emit('enable_camera_enhance');
      callback()
    });

    this.socket.on("closeStreamEnhance", (callback) => {
      // this.memCache.set(FACE_REGISTER_ENHANCER, []);
      this.io.emit('disable_camera_enhance');
      callback()
      this.socket.emit("takeImageEnhance",this.memCache.get(FACE_REGISTER_ENHANCER))
      // this.socket.emit("takeImageEnhance",[{image: environment.images.sample_detection, info: {left:0 , right:100, top:0, bottom:100}}])
    });

    this.socket.on("removeImageEnhance", (index, callback) => {
      // this.memCache.set(FACE_REGISTER_ENHANCER, []);
      let images = this.memCache.get(FACE_REGISTER_ENHANCER);
      if (!images) images = [];
      (images as Array<any>).splice(index, 1);
      this.memCache.set(FACE_REGISTER_ENHANCER, images);
      callback()
    });
  }
//gui ve FE xem camera
  web_opening = () => {
    // get streaming from front-end
    this.socket.on("getStream", (camera_code) => {
      let STATUS_GET_STREAM = READY;
      this.streamProcesses[camera_code] = setInterval(() => {
        // console.log(STATUS_GET_STREAM)
        let faceData = this.memCache.get(FACE_DATA_KEY + camera_code);
        let bodyData = this.memCache.get(BODY_DATA_KEY + camera_code);
        let itemData = this.memCache.get(ITEM_DATA_KEY + camera_code);
        let time = this.memCache.get(FRAME_TIME_KEY + camera_code);
        if (STATUS_GET_STREAM === READY) {
          var frame = this.memCache.get(FRAME_KEY + camera_code);
          if (!frame) {
            frame = environment.images.camera_error;
          }
          // canvas.drawImage(img, 0, 0);
          // left = x1, top = y1 
          // right = x2 bottom = y2
          STATUS_GET_STREAM = RUNNING;
          const img = gm(Buffer.from(frame as string, 'base64')).setFormat('png')
          this.detectServices.drawFaces(img, faceData as Array<any>)
          this.detectServices.drawBody(img, bodyData as Array<any>)
          this.detectServices.drawItem(img, itemData as Array<any>)
          this.detectServices.drawFps(img, time ? time as number : 1000)
          const no_mask = this.memCache.get(NO_MASK_KEY + camera_code)
          this.memCache.set(NO_MASK_KEY + camera_code, false)
          img.toBuffer((err, buffer) => {
            if (err) {
              // console.log(err)
              this.socket.emit(
                "takeStream",
                {
                  camera_code: camera_code,
                  image: "data:image/jpg;base64," + frame,
                  faceData: faceData && (faceData as Array<any>).length ? (faceData as Array<any>).map(e => e.code) : [],
                },
                () => {
                  STATUS_GET_STREAM = READY;
                }
              );
            } else {
              this.socket.emit(
                "takeStream",
                {
                  camera_code: camera_code,
                  image: "data:image/jpg;base64," + buffer.toString('base64'),
                  faceData: faceData && (faceData as Array<any>).length ? (faceData as Array<any>).map(e => e.code) : [],
                  no_mask: no_mask

                },
                () => {
                  STATUS_GET_STREAM = READY;
                }
              );
            }
          })
        }
      }, 1000 / this.fps);
      // console.log('open ', camera_code)
    });
  };
  //xem camera duoi dang raw
  web_opening_raw = () => {
    // get streaming from front-end
    this.socket.on("getStreamRaw", (camera_code) => {
      let STATUS_GET_STREAM = READY;
      this.streamProcesses['RAW' + camera_code] = setInterval(() => {
        if (STATUS_GET_STREAM === READY) {
          var frame = this.memCache.get(FRAME_KEY + camera_code);
          if (!frame) {
            frame = environment.images.camera_error;
          }
          STATUS_GET_STREAM = RUNNING;
          this.socket.emit(
            "takeStreamRaw",
            {
              camera_code: camera_code,
              image: "data:image/jpg;base64," + frame,
            },
            () => {
              STATUS_GET_STREAM = READY;
            }
          );
        }
      }, 1000 / this.fps);
    });
  };

  web_closing = () => {
    this.socket.on("closeStream", (camera_code, callback) => {
      clearInterval(this.streamProcesses[camera_code]);
      callback();
      // console.log('close ', camera_code)
    });
  };
  web_closing_raw = () => {
    this.socket.on("closeStreamRaw", (camera_code, callback) => {
      clearInterval(this.streamProcesses['RAW' + camera_code]);
      callback();
    });
  };
}
