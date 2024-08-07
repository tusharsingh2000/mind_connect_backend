const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const settingModel = new Schema(
  {
    price_per_mint: { type: Number, default: 0 },   // price per mint
    slots_diff: { type: Number, default: 0 },   // slots difference in mints

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const setting = MONGOOSE.model("setting", settingModel);
module.exports = setting;
