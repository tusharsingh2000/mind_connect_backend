const Model = require("../../models");
// const moment = require("moment");
// const Utility = require("../../utility/Utility");
const mongoose = require("mongoose");
const common = require("./common");


async function sendMessage(data, user) {
    data.senderId = user;
    // if (data.type == "LOCATION") {
    //     data.latitude = data.latitude;
    //     data.longitude = data.longitude;
    //     data.text = data.message;
    // } else {
    data.text = data.message;
    // }
    let message = await Model.ChatMessage.create(data);
    message = await Model.ChatMessage.findById(message._id).populate("senderId", "fullName phone email image").populate("recieverId", "fullName phone email image").lean();

    let sender = await getUserDetail(user);
    let name = await common.getUserName(sender);
    let receiver = await getUserDetail(data.recieverId);

    let title = `${name}`;
    let messages = `${message.text} `;
    switch (data.type) {
        case 'TEXT':
            messages = `${message.text} `;
            break;
        case 'IMAGE':
            messages = `shared a image `;
            break;
        case 'VIDEO':
            messages = `shared a video `;
            break;
        case 'AUDIO':
            messages = `shared a audio `;
            break;
        case 'LOCATION':
            messages = `shared a location `;
            break;
        case 'POST_SHARE':
            messages = `shared a post `;
            break;
        default:
            // eslint-disable-next-line no-unused-expressions
            "not found";
    }

    let sendNotification = {
        title: title,
        message: messages,
        pushType: 7,
        senderId: {
            fullName: name,
            firstName: sender.firstName,
            lastName: sender.lastName,
            _id: sender._id,
            image: sender.image,
            connectionId: data.connectionId
        }
    };
    console.log('sendNotification: ', sendNotification);
    await common.notificationAccDevice(receiver, sendNotification);

    await common.sendNotificationCount(receiver._id);

    return message;
}

async function markMessageAsRead(data, user) {
    let qry = { connectionId: mongoose.Types.ObjectId(data.connectionId) };

    if (user) {
        qry.$or = [{ senderId: mongoose.Types.ObjectId(user._id) },
        { recieverId: mongoose.Types.ObjectId(user._id) }];
    }

    await Model.ChatMessage.updateMany(qry, {
        $set: { isReaded: true }
    });
}

async function sendGroupMessage(data, user) {
    let group = await Model.group.findOne({ _id: data.groupId }).lean();
    // console.log(JSON.stringify(group))

    data.senderId = user;
    if (data.type == "TEXT") {
        data.text = data.message;
        // } else if(data.type == "IMAGE") {
        //     data.uploads = data.file
    }
    data.members = group.member;
    let message = await Model.GroupChat.create(data);
    message = await Model.GroupChat.findById(message._id)
        .populate("senderId", "fullName phone email image").lean();
    console.log(JSON.stringify(message));
    return message;
}

async function getUserDetail(user) {
    return await Model.user.findOne({ _id: mongoose.Types.ObjectId(user) }).lean();
}
module.exports = {
    sendMessage,
    markMessageAsRead,
    sendGroupMessage,
    getUserDetail
};
