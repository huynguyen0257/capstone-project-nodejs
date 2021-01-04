import { Expose } from "class-transformer";
import { BaseVM, BaseCM, BaseUM } from "./base.vm";

export class AuthGM extends BaseVM {
    public Username!: string;
    public Password!: string;
    constructor() {
        super();
    }
}

export class AuthResetPassword extends BaseVM {
    public Email!: string;
    public Code!: string;
    public Password!: string;
    constructor() {
        super();
    }
}

export class AuthChangePassword extends BaseVM {
    @Expose() public NewPassword!: string;
    @Expose() public OldPassword!: string;

    constructor() {
        super();
    }
}

export class AuthVM extends BaseVM {
    public Id!: string;
    public Username!: string;
    public FullName!: string;
    public Password!: string;
    public Email!: string;
    public Phone?: string;
    public Avatar?: string;
    public Gender?: boolean;
    public BirthDate?: Date;
    public Child?: UserRoleVM[];
    constructor() {
        super();
    }
}
export class UserRoleVM extends BaseVM {
    public Id!: string;
    public UserId!: string;
    public RoleId!: string;
    constructor() {
        super();
    }
}

export class ResetPasswordCM extends BaseCM {
    public Email!: string;
    public Code!: number;
    public Password!: string;
    constructor() {
        super();
    }
}


