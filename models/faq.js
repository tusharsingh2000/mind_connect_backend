const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const faqModel = new Schema({
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false }

},
    { timestamps: true }
);

const cms = MONGOOSE.model("faq", faqModel);
module.exports = cms;
