import { Model, model, Schema, Query } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  email: string;
  name: {
    first: string;
    last: string;
  };
  password: string;
  isAdministrator: Boolean;
  address: IAddress;
  profilePicture?: string;
  birthDate: Date;
  gender: string;
  socialMediaUrls?: {
    facebook?: string;
    instagram?: string;
  };
  isActive: boolean;
}

export interface IAddress {
  postalCode: String;
  city: String;
}

export enum userRole {
  User = "u",
  Admin = "a",
}
interface IUserMethods {
  isCorrectPassword(password: string): Promise<boolean>;
}
type UserModel = Model<IUser, {}, IUserMethods>;

/**
 * Adressen werden später in das UserSchema eingefügt und als teil eines Users in mongoDB gespeichert
 */
export const addressSchema = new Schema({
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
});

const userSchema = new Schema<IUser, UserModel>({
  email: { type: String, required: true, unique: true },
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true },
  },
  password: { type: String, required: true },
  isAdministrator: { type: Boolean, default: false },
  address: addressSchema,
  profilePicture: String,
  birthDate: { type: Date, required: true },
  gender: { type: String, required: true },
  socialMediaUrls: {
    facebook: String,
    instagram: String,
  },
  isActive: { type: Boolean, default: true },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
});

userSchema.pre(
  "updateOne",
  { document: false, query: true },
  async function () {
    const update = this.getUpdate() as
      | (Query<any, IUser> & { password?: string })
      | null;
    if (update?.password != null) {
      const hashedPassword = await bcrypt.hash(update.password, 10);
      update.password = hashedPassword;
    }
  }
);

userSchema.method(
  "isCorrectPassword",
  async function (password: string): Promise<boolean> {
    const isPW = await bcrypt.compare(password, this.password);
    return isPW;
  }
);

export const User = model<IUser, UserModel>("User", userSchema);
