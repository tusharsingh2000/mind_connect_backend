const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const cmsModel = new Schema(
  {
    price: { type: String, default: "" },   // price per mint
   
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const cms = MONGOOSE.model("cms", cmsModel);
module.exports = cms;
