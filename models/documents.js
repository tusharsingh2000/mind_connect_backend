const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const documentsModel = new Schema({

    userId: { type: Schema.Types.ObjectId, ref: "user" },
    name: { type: String, default: "" },
    number: { type: String, default: "" },
    expiry_date: { type: String, default: "" },

    docs: [{
        front: {
            type: String,
            default: ""
        },
        back: {
            type: String,
            default: ""
        }
    }],

    isDeleted: { type: Boolean, default: false, index: true },
    isBlocked: { type: Boolean, default: false, index: true }
}, { timestamps: true }
);

module.exports = MONGOOSE.model("document", documentsModel);

