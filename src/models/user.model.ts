import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "../enums/role.enum";

export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  picture?: string;
  active: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    employeeId: { type: String },
    picture: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
