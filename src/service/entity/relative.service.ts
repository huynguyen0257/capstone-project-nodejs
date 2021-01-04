import { Sequelize } from "sequelize-typescript";
import { Relative, RelativeFaceImage, SecurityMan, Student, User, UserRole } from "./../../model";
import { BaseService, IService } from '../generic';
import { DeviceTokenService, NotificationService, UserService } from ".";
import { RoleService } from "./role.service";
import { environment } from "../../environment";
import { FirebaseService } from "../fire-base.service";
import { RelativeFaceImageService } from "./relative.face.image.service";
import { RoomService } from "./room.service";

export interface IRelativeService extends IService<Relative> {
}

export class RelativeService extends BaseService<Relative> implements IRelativeService {
    private readonly userService: UserService;
    private readonly notificationService: NotificationService;
    private readonly roleService: RoleService;
    private readonly deviceTokenService: DeviceTokenService;
    private readonly relativeFaceImageService: RelativeFaceImageService;
    private readonly roomService: RoomService;
    private readonly firebaseService: FirebaseService;

    constructor(sequelize: Sequelize) {
        super(Relative, sequelize);
        this.userService = new UserService(sequelize);
        this.notificationService = new NotificationService(sequelize);
        this.roleService = new RoleService(sequelize);
        this.deviceTokenService = new DeviceTokenService(sequelize);
        this.relativeFaceImageService = new RelativeFaceImageService(sequelize);
        this.roomService = new RoomService(sequelize);
        this.firebaseService = new FirebaseService();
    }
    /**
     * @required Student & RelativeFaceImage data in Realtive object
     * @param relatives 
     */
    public checkout = (relatives: Relative[]): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            let successRelative: string = '';
            let failRelative: string = '';
            for (const relative of relatives) {
                if (!relative.IsCheckout) {
                    //Update student data
                    relative.IsCheckout = !relative.IsCheckout
                    relative.save();

                    //Add result to list result
                    if (successRelative.length > 0) {
                        successRelative += `\n`
                    }
                    successRelative += `Relative ${relative.Name} of student ${relative.Student.Code}`;

                    //Process image in database & firebase
                    if (relative.RelativeFaceImages && relative.RelativeFaceImages.length > 0) {
                        //Process to python
                        let room = await this.roomService.getById({ Id: relative.Student.RoomId! }, []);
                        this.userService.TriggerCheckoutToPython({
                            Username: relative.IdentityCardNumber,
                            BuildingId: room.BuildingId,
                            IsRemove: true
                        });

                        let relativeFaceImageId: number[] = [];
                        relative.RelativeFaceImages.map((relativeFaceImage: RelativeFaceImage) => {
                            if (relative.Avatar != relativeFaceImage.ImageUrl) {
                                // console.log(`remove relative face imageUrl: ${relativeFaceImage.ImageUrl}`);
                                this.firebaseService.removeUserFaceImages(relativeFaceImage.ImageUrl);
                            }
                            relativeFaceImageId.push(relativeFaceImage.Id);
                        })
                        relativeFaceImageId.map(id => {
                            // console.log(`remove RelativeFaceImageId: ${id}`);
                            this.relativeFaceImageService.remove(id);
                        })
                    }
                } else {
                    if (failRelative.length > 0) {
                        failRelative += `\n`
                    }
                    failRelative += `Relative ${relative.Name} of student ${relative.Student.Code} already check out\n`
                }
            }
            resolve({ Success: successRelative, Fail: failRelative });
        })
    }
    public updateCheckout = async () => {
        let relatives = await this.repository.getAll({ IsCheckout: false }, [this.sequelize.getRepository(Student), this.sequelize.getRepository(RelativeFaceImage)])
        let message: any = {};
        if (relatives.length > 0) {
            message = await this.checkout(relatives);
            var userIds: number[] = [];
            var sendIds: number[] = [];
            var role = await this.roleService.findByAnotherTableCondition(
                { Name: "Manager" },
                [this.sequelize.getRepository(UserRole)]
            )
            console.log(role[0].Name);
            if (role[0].UserRole) {
                role[0].UserRole.map((userRole) => {
                    userIds.push(userRole.UserId);
                });
            }
            console.log(userIds);
            for (let id of userIds) {
                console.log(id);
                let mes = message;
                //create notification
                var noti: any = {
                    Title: environment.notification.daily_check_relative.data.title,
                    Body: `${environment.notification.daily_check_relative.data.body}\n ${mes.Success}`,
                    Type: environment.notification.type.warining_case_message,
                    UserId: id,
                    CaseId: null,
                    ActionClick: `${environment.notification.daily_check_relative.web.fcmOption.actionLink}/${relatives[0].StudentId}?tabPane=3`,
                    CreatedBy: "Daily check relative system",
                };
                var tokens = await this.deviceTokenService.findByAnotherTableCondition(
                    { UserId: id },
                    [
                        {
                            model: this.sequelize.getRepository(User),
                            include: [this.sequelize.getRepository(SecurityMan)],
                        },
                    ]
                )
                let sendToken = tokens.filter((e: any) => e.User.SecurityMan && e.User.SecurityMan.IsOnline).map((e: any) => e.Token)
                console.log(sendToken);
                this.notificationService
                    .create(
                        noti,
                        sendToken
                    )
                    .then((_) => {
                        sendIds.push(id);
                    });
            }
        }
    }

}
