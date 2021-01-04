import { environment } from "../environment";
import { format } from "util";
import admin from "firebase-admin";
import { TokenMessage } from "firebase-admin/lib/messaging";
import axios from "axios";
import { Readable, Stream } from "nodemailer/lib/xoauth2";
import Moment from "Moment";


// CHANGE: The path to your service account
var serviceAccount = require("../asset/files/sdms-captone-4ab5b-firebase-adminsdk-77ku7-4fa981d7be.json"); //huyngse63158

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "sdms-captone-4ab5b.appspot.com", //huyngse63158
});
const bucket = admin.storage().bucket(environment.firebase.gcloudStorageBucket);
const config = {
  action: 'read',
  expires: '03-01-2500'
};

export class FirebaseService {
  constructor() { }

  public saveFileCase = async (file: any, modelName: string): Promise<string> => {
    var filename: string = `dangeorus-case-files/${modelName}/${new Date().toISOString()}${file.originalname}`;
    const createBlob = bucket.file(filename);
    const blobStream = createBlob.createWriteStream({
      public: true,
    });
    return new Promise((resolve, reject) => {
      blobStream.on("error", (err) => {
        reject(err);
      });
      blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${createBlob.name}`
        );
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }
  /***
   * Save with blob/FaceImage/${username}/
   * type: 
   * - 1. support face detection - modelName : username
   * - 2. avatar of all user - modelName : username
   * - 3. dangerous case images - modelName : dangerousCase code
   */
  public saveImage = async (file: any, modelName: string, type: number): Promise<string> => {
    var filename: string = "";
    if (type === 1) {
      filename = `users-face-images/${modelName}/${new Date().toISOString()}${file.originalname
        }`;
    } else if (type === 2) {
      filename = `avatar/${modelName}-${new Date().toISOString()}${file.originalname
        }`;
    } else if (type === 3) {
      filename = `dangeorus-case-files/${modelName}/${new Date().toISOString()}${file.originalname}`;
    } else {
      filename = `building-images/${new Date().toISOString()}${file.originalname}`;
    }

    const createBlob = bucket.file(filename);
    const blobStream = createBlob.createWriteStream({
      public: true,
    });
    return new Promise((resolve, reject) => {
      blobStream.on("error", (err) => {
        reject(err);
      });
      blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${createBlob.name}`
        );
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  };

  public removeAvatar = (avatarUrl: string): Promise<any> => {
    avatarUrl = avatarUrl.substring(avatarUrl.indexOf('avatar'));
    return this.removeFirebaseImage(avatarUrl);
  }
  public removeBuildingImage = (buildingImageUrl: string): Promise<any> => {
    buildingImageUrl = buildingImageUrl.substring(buildingImageUrl.indexOf('building-images'));
    return this.removeFirebaseImage(buildingImageUrl);
  }
  public removeUserFaceImages = (faceImageUrl: string): Promise<any> => {
    faceImageUrl = faceImageUrl.substring(faceImageUrl.indexOf('users-face-images'));
    return this.removeFirebaseImage(faceImageUrl);
  }
  // public removeRelativeFaceImages = (avatarUrl: string): Promise<any> => {
  //   avatarUrl = avatarUrl.substring(avatarUrl.indexOf('avatar'));
  //   return this.removeFirebaseImage(avatarUrl);
  // }
  private removeFirebaseImage = (filename: string): Promise<any> => {
    const removeBlob = bucket.file(filename);
    return removeBlob.delete();
  }

  public sendNotification = (
    deviceToken: string[],
    title: string,
    body: string,
    type: string,
    action_click: string,
    createdBy: string
  ) => {
    //#region send by firebase-admin but not work on action_click
    var message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        CreatedBy: createdBy,
        link: action_click,
        type: type
      },
      android: {
        notification: {
          clickAction: "https://localhost:3000/",
          icon: "stock_ticker_update",
          color: "#7e55c3",
        },
      },
      apns: {
        fcmOptions: {},
      },
      webpush: {
        headers: {
          image:
            "https://scontent.fhan5-5.fna.fbcdn.net/v/t1.0-9/120771894_1639645052862138_6632684723044552607_o.jpg?_nc_cat=107&_nc_sid=09cbfe&_nc_ohc=ggKQ6bDU9ygAX8IyTts&_nc_ht=scontent.fhan5-5.fna&oh=94b3b6217fb08129a22f662d93459725&oe=5FA346DE",
        },
        fcmOptions: {
          link: action_click,
        },
      },
      tokens: deviceToken,
    };

    return admin.messaging().sendMulticast(message)
      .then(() => {
        console.log("send sendMulticast successful with token : ");
        console.log(deviceToken);
      })
      .catch((error) => {
        console.log("send sendMulticast fail with token: ");
        console.log(deviceToken);
        console.log(error);
      });
  };

  /***
   * Save with blob/FaceImage/${username}/
   * type: 
   * - 1. support face detection - modelName : username
   * - 2. avatar of all user - modelName : username
   * - 3. dangerous case images - modelName : dangerousCase code
   */
  public saveImageBase64 = async (base64: string, modelName: string, type: number): Promise<string> => {
    var filename: string = "";
    if (type === 1) {
      filename = `users-face-images/${modelName}/${new Date().toISOString()}.jpg`;
    } else if (type === 2) {
      filename = `avatar/${modelName}-${new Date().toISOString()}.jpg`;
    } else {
      filename = `dangeorus-case-files/${modelName}/${new Date().toISOString()}.jpg`;
    }
    const imgBuffer = Buffer.from(base64, 'base64')

    const bufferStream = new Stream.PassThrough();
    // var bufferStream = new Readable()
    bufferStream.end(imgBuffer);
    // bufferStream.push(imgBuffer)
    // bufferStream.push(null);
    const createBlob = bucket.file(filename);

    const blobStream = bufferStream.pipe(createBlob.createWriteStream({
      public: true,
      metadata: {
        contentType: 'image/jpeg'
      }
    }))
    return new Promise((resolve, reject) => {
      blobStream.on('error', error => {
        reject(`news.provider#uploadPicture - Error while uploading picture ${error}`);
      })
        .on('finish', () => {
          // The file upload is complete.
          // createBlob.getSignedUrl({action: 'read', expires:'03-17-2025'}, (error: any, url: any) => {
          //   if (error) {
          //     reject(error);
          //   }
          //   resolve(url);
          // });

          const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${createBlob.name}`
          );
          resolve(publicUrl);
          // console.log("news.provider#uploadPicture - Image successfully uploaded: ", JSON.stringify(createBlob));
        });
    })
  }
}
