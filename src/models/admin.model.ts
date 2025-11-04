import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  otp?: string | null;
  otpExpire?: Date | null;
  verified: boolean;
  role: "ADMIN";
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, default: null },
    otpExpire: { type: Date, default: null },
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ["ADMIN"], default: "ADMIN" },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", adminSchema);
