const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const constant = require(".././utility/constant");

let slotSchema = new Schema({

    userId: { type: Schema.Types.ObjectId, ref: 'user', index: true },
    day: {
        type: String,
        enum: [constant.DAYS],
        default: constant.DAYS.Sunday
    },
    openTime: {
        type: String,
        default: ""
    },
    closeTime: {
        type: String,
        default: ""
    },
    breakTime: {
        type: String,
        default: ""
    },
    isDeleted: { type: Boolean, default: false, index: true }

}, {
    timestamps: true
});
let driverSlot = mongoose.model("slotsTime", slotSchema);
module.exports = driverSlot;