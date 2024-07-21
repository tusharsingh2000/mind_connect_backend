const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminModel = new Schema({
    firstName: {
        type: String,
        default: "",
        trim: true
    },
    lastName: {
        type: String,
        default: "",
        trim: true
    },
    name: {
        type: String,
        default: "",
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    countryCode: {
        type: String,
        trim: true
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    isEmailVerify: {
        type: Boolean,
        default: false
    },
    isPhoneVerify: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deviceType: {
        type: String,
        enum: ['IOS', 'ANDROID', 'WEB']
    },
    verificationType: {
        type: Number,
        enum: [0, 1] //0 For Phone, 1 For email
    },
    address: {
        type: String

    },
    deviceToken: {
        type: String,
        default: '',
        select: false
    },
    role: {
        type: String,
        enum: ['ADMIN', 'SUBADMIN'],
        default: 'ADMIN'
    },
    roleType: {
        type: String,
        default: ''
    },
    subAdminId: { type: Schema.Types.ObjectId, ref: "subadmin" },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: { type: [Number], default: [0, 0] }
    },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
AdminModel.index({ location: "2dsphere" });
AdminModel.pre(/save|create|update/i, function (next) {
    if (this.get("latitude") && this.get("longitude")) {
        const longitude = this.get("longitude");
        const latitude = this.get("latitude");
        const geoPoint = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
        this.set({ geoPoint });
    }
    next();
});

const Admin = mongoose.model('admin', AdminModel);
module.exports = Admin;