import mongoose, { Schema, Document } from "mongoose";
import { SchoolStatus } from "../enums/status.enum";

interface IFeature {
  title: string;
  description: string;
  type: "text" | "image";
  content: string; // text or image path
}

interface IUSP {
  title: string;
  description: string;
}

export interface ISchool extends Document {
  schoolIcon?: string;
  schoolName: string;
  shortDescription: string;
  urlEndpoint: string;
  status: SchoolStatus;

  promoTitle?: string;
  promoDescription?: string;
  promoMedia?: string;

  usp: IUSP[];

  features: IFeature[];

  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
}

const FeatureSchema = new Schema<IFeature>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["text", "image"], required: true },
  content: { type: String, required: true },
});

const USPSchema = new Schema<IUSP>({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const SchoolSchema = new Schema<ISchool>(
  {
    // 🧩 Basic Info
    schoolIcon: { type: String },
    schoolName: { type: String, required: true, unique: true },
    shortDescription: { type: String, required: true },
    urlEndpoint: { type: String, required: true, unique: true },
    status: { type: String, enum: Object.values(SchoolStatus), default: SchoolStatus.ACTIVE },

    // 🎯 Promotional Content
    promoTitle: { type: String },
    promoDescription: { type: String },
    promoMedia: { type: String },

    // 💎 Unique Selling Propositions
    usp: [USPSchema],

    // ✨ Features (min 4, max 8)
    features: {
      type: [FeatureSchema],
      validate: [
        {
          validator: function (val: IFeature[]) {
            return val.length >= 4 && val.length <= 8;
          },
          message: "Features must be between 4 and 8 items.",
        },
      ],
    },

    // 🧠 SEO & Meta Info
    metaTitle: { type: String, required: true },
    metaKeywords: { type: String, required: true },
    metaDescription: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISchool>("School", SchoolSchema);
