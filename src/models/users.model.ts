import bcrypt from "bcrypt";
import { IsEmail, IsOptional, IsString } from "class-validator";
import mongoose, { Document, Schema } from "mongoose";

import { MODELS } from "@common/constants";
import ITimesStamp from "@common/interfaces/timestamp.interface";
import toJSON from "@utils/toJSON.plugin";

export class IUser extends ITimesStamp {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  lastLogin?: string;
}

export interface IUserSchema extends Document, IUser {}

const userSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 16,
      private: true,
    },
    lastLogin: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.plugin(toJSON);

export default mongoose.model<IUserSchema>(MODELS.USERS, userSchema);
