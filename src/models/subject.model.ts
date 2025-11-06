import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  subjectName: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    subjectName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubject>("Subject", SubjectSchema);
