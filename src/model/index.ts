import { User } from "./user";
import { UserRole } from "./user-role";
import { Role } from "./role";
import { Student } from "./student";
import { University } from "./university";
import { UserFaceImage } from "./user-face-image";
import { Notification } from "./notification"
import { DeviceToken } from "./device-token"
import { DangerousCase } from "./dangerous-case"
import { CaseImage } from "./case-image"
import { SecurityMan } from "./security-man"
import { Room } from "./room"
import { Building } from "./building"
import { Camera } from "./camera"
import { Relative } from "./relative"
import { CaseHistory } from "./case-history"
import { CaseHistoryStatus } from "./case-history-status"
import { Policy } from "./policy"
import { PolicyLevel } from "./policy-level"
import { ProhibitedItemCase } from "./prohibited-item-case"
import { ProhibitedItem } from "./prohibited-item"
import { ProhibitedItemImage } from "./prohibited-item-image"
import { StudentCase } from "./student-case"
import { RelativeFaceImage } from "./relative-face-image";
import { Configuration } from "./configuration";
import { CaseHistoryStatusFamily } from "./case-history-status-family";


export * from "./user";
export * from "./user-role";
export * from "./role";
export * from "./student";
export * from "./university";
export * from "./user-face-image";
export * from './notification';
export * from './device-token';
export * from './dangerous-case';
export * from './case-image';
export * from "./security-man";
export * from "./room";
export * from "./building";
export * from "./camera";
export * from "./relative";
export * from "./relative-face-image";
export * from "./case-history";
export * from "./case-history-status";
export * from "./policy";
export * from "./policy-level";
export * from "./prohibited-item-case";
export * from "./prohibited-item";
export * from "./prohibited-item-image";
export * from "./student-case";
export * from "./configuration";
export * from "./case-history-status-family";
export const ENTITIES = [User, UserRole, Role, Student, University, UserFaceImage, Notification, DeviceToken, DangerousCase, CaseImage, Building, Room, SecurityMan
    , Camera, Relative, RelativeFaceImage, CaseHistory, CaseHistoryStatus, Policy, PolicyLevel, ProhibitedItemCase, ProhibitedItem, ProhibitedItemImage, StudentCase,Configuration
, CaseHistoryStatusFamily];
