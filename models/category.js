const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryModel = new Schema({
    name: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    type: {
        type: Number,
        enum : [1, 2],
        default: 1
    },
    isDeleted: { type: Boolean, default: false, index: true },
    isBlocked: { type: Boolean, default: false, index: true }

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const category = mongoose.model('category', categoryModel);
module.exports = category;