const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const educationModel = new Schema({
    name: {
        type: String,
        default: ""
    },
    instituteName: {
        type: String,
        trim: true,
        default: ''
    },
    link: {
        type: String,
        trim: true,
        default: ''
    },
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    isDeleted: { type: Boolean, default: false, index: true },
    isBlocked: { type: Boolean, default: false, index: true }
   
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const education = mongoose.model('education', educationModel);
module.exports = education;