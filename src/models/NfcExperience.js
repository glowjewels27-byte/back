import mongoose from "mongoose";

const nfcExperienceSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    audioName: {
      type: String,
      required: true,
      trim: true
    },
    audioDataUrl: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("NfcExperience", nfcExperienceSchema);
