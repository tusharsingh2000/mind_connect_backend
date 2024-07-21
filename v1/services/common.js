const Model = require("../../models");
// const utility = require("../../utility/Utility");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// const Otp = require("./otp");
const notification = require('../../utility/pushNotifications');
// const moment = require('moment-timezone');


async function pagination(pipeline, skip, limit) {
    pipeline.push({
        $facet: {
            metadata: [{
                $group: {
                    _id: null,
                    total: { $sum: 1 }
                }
            }],
            data: [
                //         { $sort: sort },
                { $skip: skip },
                { $limit: limit }
            ]
        }
    }, {
        $project: {
            total: { $arrayElemAt: ['$metadata.total', 0] },
            data: 1
        }
    });
    return pipeline;
}
async function convertMap(obj) {
    return Array.from(obj).reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});
}
async function addNotification(userId, tittle, message, reactId, postId, pushType) {
    await Model.notification.create({ userId: userId, tittle: tittle, message: message, reactId: reactId, postId: postId, pushType: pushType });
}
async function sendTagUserNotification(users, sendNotification, userDetail, pushType) {
    if (users && users.length > 0) {
        let user;
        for (let i = 0; i < users.length; i++) {
            const e = users[i];
            if (userDetail && userDetail == true) {
                user = e;
            } else {
                user = await Model.user.findOne({ _id: ObjectId(e), isDeleted: false });
            }
            if (user) {
                if (user.deviceToken && user.deviceToken.length > 0) {
                    await addNotification(user._id, sendNotification.title, sendNotification.message, pushType);
                    sendNotification.userId = user._id;
                    await notificationAccDevice(user, sendNotification);
                }
            }
        }
    }
}
async function notificationAccDevice(user, sendNotification) {
    if (user.deviceType == 'IOS') {
        await notification.sendNotificationToIos(sendNotification, user.deviceToken);
    } else {
        await notification.sendNotification(sendNotification, user.deviceToken);
    }
}

module.exports = {
    pagination,
    convertMap,
    addNotification,
    sendTagUserNotification,
    notificationAccDevice
};