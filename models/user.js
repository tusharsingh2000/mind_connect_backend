const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserModel = new Schema({

    isSocialLogin: { type: Boolean, default: false },
    socialId: { type: String },
    socialType: { type: String, enum: ["FACEBOOK", "GOOGLE", "APPLE"] },
    role: { type: String, enum: ["user", "consultant"], default: "user" },
    fullName: { type: String, default: "", trim: true },
    userName: { type: String, default: "", trim: true },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, lowercase: true, index: true, trim: true },
    phone: { type: String, trim: true, default: "", index: true },
    countryCode: { type: String, trim: true },
    countryName: { type: String, trim: true },
    isProfileComplete: { type: Boolean, default: false },
    isEmailVerify: { type: Boolean, default: false },
    isPhoneVerify: { type: Boolean, default: false },
    isVerifiedByAdmin: { type: Boolean, default: false },
    password: { type: String, default: "", select: false },
    image: { type: String, default: "" },
    coverImage: { type: String, default: "" }, 
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHERS"] },
    jti: { type: String, default: "", trim: true },
    zipCode: { type: String, default: null },
    dob: { type: String, default: null },
    profileCompleteAt: { type: Number, default: 0 },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: { type: [Number], default: [0, 0] }
    },

    deviceType: { type: String, default: "" },
    deviceToken: { type: String, default: "" },

    isNotificationEnable: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    isBlocked: { type: Boolean, default: false, index: true },
    latitude: { type: String, default: 0 },
    longitude: { type: String, default: 0 },
    types : [{ type: Schema.Types.ObjectId, ref: 'category' }], // user side used
    isVerified: { type: Boolean, default: false },  // sp account verified from admin
    categoryId: [{ type: Schema.Types.ObjectId, ref: 'category' }] // sp category



}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
}
);
UserModel.index({ userLocation: "2dsphere" });

UserModel.pre(/save|create|update/i, function (next) {
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
const User = mongoose.model("user", UserModel);
module.exports = User;
