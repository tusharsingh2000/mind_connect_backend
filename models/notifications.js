const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

const notificationModel = new Schema(
    {
        userId: { type: MONGOOSE.Types.ObjectId, ref: "user" },// for Mobile App

        pushType: { type: Number,default:0 },

        tittle: { type: String, default : '' },
        message: { type: String, default : '' },
        type: { type: String , enum : ['All','User', 'SubAdmin'], default : 'User'},
        
        userType : { type: String,  enum : ['ADMIN', 'USER'], default : 'USER' },

        notificationType : { type: String, default : '' },
        isRead: { type: Boolean, default: false },

        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const notification = MONGOOSE.model("notification", notificationModel);
module.exports = notification;
