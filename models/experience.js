const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const experienceModel = new Schema(
  {
    type: {
      type: String,
      default: "",
    },
    from: {
      type: String,
      default: "",
    },
    to: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    categoryId: [{ type: Schema.Types.ObjectId, ref: "category" }],
    isCurrent: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    isBlocked: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
experienceModel.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

experienceModel.set("toObject", {
  transform: (doc, ret) => {
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});
const experience = mongoose.model("Experience", experienceModel);
module.exports = experience;
