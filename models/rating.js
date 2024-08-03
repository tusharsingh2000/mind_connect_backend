const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ratingModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    spId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    rating: {
        type: Number,
        default: 0,
        trim: true
    },
    eemarks: {
        type: String,
        default: "",
        trim: true
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
const Rating = mongoose.model('rating', ratingModel);
module.exports = Rating;