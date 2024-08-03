const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const wishlistModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    spId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    desc: {
        type: String,
        trim: true,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
const wishlist = mongoose.model('wishlist', wishlistModel);
module.exports = wishlist;