const MONGOOSE  = require("mongoose");
const Schema    = MONGOOSE.Schema;

const AddressModel = new Schema({
    userId     : { type: Schema.Types.ObjectId, ref: "user" },
    // type       : { type: String, enum: [ "HOME", "WORK", "OTHER" ], default: "HOME" },

    state       : { type: String, default: "" },
    city       : { type: String, default: "" },
    pincode       : { type: String, default: "" },
    address   : { type: String, default: ""},


    area       : { type: String, default: ""},
    latitude   : { type: Number, default: 0 },
    longitude  : { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
    isBlocked: { type: Boolean, default: false, index: true }
    // location   : { type: { type: String, default: "Point" }, coordinates: { type: [Number], default: [0, 0] } },
},{ timestamps: true }
);

AddressModel.index({ location: "2dsphere" });

module.exports = MONGOOSE.model("address", AddressModel);

