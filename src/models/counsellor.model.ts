import mongoose, { Schema, Document } from "mongoose";

export enum CounsellorStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IAvailability {
  day: string; // e.g. Monday
  from: string; // e.g. 09:00 AM
  to: string;   // e.g. 05:00 PM
}

export interface ICounsellor extends Document {
  profilePic?: string;
  name: string;
  email: string;
  phone: string;
  isGeneral: boolean; // general counsellor or not
  bindToSchools?: mongoose.Types.ObjectId[]; // list of school IDs
  enableVirtualCounselling: boolean;
  availability?: IAvailability[];
  status: CounsellorStatus;
}

const AvailabilitySchema = new Schema<IAvailability>({
  day: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
});

const CounsellorSchema = new Schema<ICounsellor>(
  {
    profilePic: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    isGeneral: { type: Boolean, default: false },
    bindToSchools: [{ type: mongoose.Schema.Types.ObjectId, ref: "School" }],
    enableVirtualCounselling: { type: Boolean, default: false },
    availability: [AvailabilitySchema],
    status: {
      type: String,
      enum: Object.values(CounsellorStatus),
      default: CounsellorStatus.ACTIVE,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICounsellor>("Counsellor", CounsellorSchema);
