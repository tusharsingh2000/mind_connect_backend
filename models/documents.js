const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;
const constant = require(".././utility/constant");

const documentsModel = new Schema({

    userId: { type: Schema.Types.ObjectId, ref: "user" },
    name: { type: String, default: "" },
    number: { type: String, default: "" },
    expiry_date: { type: String, default: "" },
    type: {
        type: String,
        enum: [constant.DOCUMENT_TYPE],
        default: constant.DOCUMENT_TYPE.OTHER
    },

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

