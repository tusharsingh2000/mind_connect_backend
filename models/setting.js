const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const settingModel = new Schema(
  {
    price: { type: String, default: "" },   // price per mint
   
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const setting = MONGOOSE.model("setting", settingModel);
module.exports = setting;
