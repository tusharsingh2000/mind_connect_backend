const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const bannerModel = new Schema({
    
    remarks: { type: String, default: "" },

    link: { type: String, default: "" },
    
    type: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false }

},
    { timestamps: true }
);

const cms = MONGOOSE.model("banner", bannerModel);
module.exports = cms;
