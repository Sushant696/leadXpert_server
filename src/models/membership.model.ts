import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "agent"],
      required: true,
    },
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, companyId: 1 }, { unique: true });

export const Membership = mongoose.model("Membership", membershipSchema)
