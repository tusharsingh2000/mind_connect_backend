const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const cmsModel = new Schema(
  {
    support: { type: String, default: "" },
    privacyPolicy: { type: String, default: "" },
    tnc: { type: String, default: "" },
    about: { type: String, default: "" },
    legal: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const cms = MONGOOSE.model("cms", cmsModel);
module.exports = cms;
