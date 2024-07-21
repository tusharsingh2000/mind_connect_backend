const server = require("socket.io");
const Model = require('../../models');
// const moment = require('moment')
const Utility = require('../../utility/Utility');
const chatService = require('./chatService');
const common = require('./common');
const constant = require("../../utility/constant");

// const Service = require("./AuthService")
// const emailService = require('../services/emailService')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const io = server();

let users = {};
var usersSockets = {};


io.use(async (socket, next) => {
  if (socket.handshake.query.token) {
    console.log(socket.handshake.query.token);
    let decoded = await Utility.jwtVerify(socket.handshake.query.token);
    console.log("user ", JSON.stringify(decoded));
    if (!decoded) return next(new Error("Authentication error"));
    else {
      users[String(socket.id)] = decoded._id;
      usersSockets[decoded._id] = socket;
      console.log("Connected socket email", decoded.email);
      socket.join(String(decoded._id));
      next();
    }
  } else {
    next(new Error("Authentication error"));
  }
}).on("connection", function (socket) {

  // one to one chat sockets
  socket.on("connectToChat", async (data) => {
    console.log("Connect to chat>>>>>>>>>>>>>>", data.connectionId);
    // const user = users[String(socket.id)];
    let roomId = "chat_" + data.connectionId;
    console.log("roomId>>>>>>>>>>>>>>", roomId);
    socket.join(roomId);
    io.to(roomId).emit("connectToChatOk", { status: 200, message: "Room successfully joined" });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:");
  });

  socket.on("sendMessage", async (data) => {
    console.log(data);
    let user = users[String(socket.id)];
    console.log("user ", JSON.stringify(user));
    let roomId = "chat_" + data.connectionId;
    let message = await chatService.sendMessage(data, user);
    if (!message) {
      return;
    }
    io.to(roomId).emit("receiveMessage", message);
  });

  socket.on("messageRecevied", async (data) => {
    let user = users[String(socket.id)];
    await chatService.markMessageAsRead(data, user);
  });

  socket.on("disConnectToChat", async (data) => {
    console.log("disconnect", JSON.stringify(data));
    try {
      if (data && data.connectionId) {
        // let user = users[String(socket.id)];
        let roomId = "chat_" + data.connectionId;
        socket.leave(roomId);
        io.to(roomId).emit("disConnectToChatOk", { status: 200, message: "Room successfully disconnected" });
      } else {
        console.log("chat Leave without proper data");
      }
    } catch (error) { console.log(error); }
  });

  // end of one to one chat

  socket.on("viewAndDownloadCount", async (data) => {
    console.log("viewAndDownloadCount >>>>>>>>>>>>>>", data);
    const user = users[String(socket.id)];
    await common.postViewandDownloadCount(user, data.postId, data.isView);
    io.to(user).emit("viewAndDownloadCount", { status: 200, message: "Counted successfully" });
  });

  socket.on("dailyTime", async (data) => {
    console.log("dailyTime >>>>>>>>>>>>>>", data);
    const user = users[String(socket.id)];
    await common.addUserTiming(user, data.time);
    io.to(user).emit("dailyTime", { status: 200, message: "dailyTime updated successfully" });
  });

  socket.on("storySeenBy", async (data) => {
    console.log("storySeenBy >>>>>>>>>>>>>>", data);
    const user = users[String(socket.id)];
    await common.storySeenBy(user, data);
    io.to(user).emit("storySeenBy", { status: 200, message: "story Seen By updated successfully" });
  });

  socket.on('callAction', async (data) => {
    console.log("callAction..................................................");
    try {
      let user = users[String(socket.id)];
      let reciever = await Model.user.findOne({ _id: ObjectId(data.userId) });
      if (data.userId) {
        let message = "";
        if (data.isAction == 1) {
          await Model.call.create({
            senderId: user._id,
            recieverId: data.userId,
            channel: data.channel,
            callType: data.callType,
            joinId: data.joinId,
            callAction: 1
          });
          message = "Accepted the call";
          let payload = {
            senderId: user._id,
            userId: data.userId,
            userType: user.role,
            userName: reciever.fullName,
            userImage: reciever.image,
            title: "",
            values: data,
            notificationType: 2,
            isUserNotification: true,
            isNotificationSave: false,
            pushType: constant.PUSH_TYPE_KEYS.ACCEPTED,
            eventType: 4
          };
          console.log('data.isAction', 1);
          process.emit("sendNotificationToUser", payload);
        }
        if (data.isAction == 2) {
          message = "Rejected the call";
          await Model.call.create({
            senderId: user._id,
            recieverId: data.userId,
            callType: data.callType,
            channel: data.channel,
            joinId: data.joinId,
            callAction: 2
          });
          let payload = {
            senderId: user._id,
            userId: data.userId,
            userType: user.role,
            userName: reciever.fullName,
            userImage: reciever.image,
            title: "",

            values: data,
            notificationType: 2,
            isUserNotification: true,
            isNotificationSave: false,
            pushType: constant.PUSH_TYPE_KEYS.HANGUP,
            eventType: 2
          };
          console.log('data.isAction', 2);
          process.emit("sendNotificationToUser", payload);
        }
        if (data.isAction == 3) {
          message = "End the call";
          let payload = {
            senderId: user._id,
            userId: data.userId,
            userType: user.role,
            userName: reciever.fullName,
            userImage: reciever.image,
            title: "",
            values: data,
            notificationType: 2,
            isUserNotification: true,
            isNotificationSave: false,
            pushType: constant.PUSH_TYPE_KEYS.END,
            eventType: 2
          };
          console.log('data.isAction', 3);
          process.emit("sendNotificationToUser", payload);
        }
        data.message = message;
        io.to(data.userId).emit('callActionOk', data);
        console.log("+++++++++++++++++++++++", data);
      } else {
        io.to(socket.id).emit('falseListner', {
          sucess: 400,
          message: "Invalid paramters"
        });
      }
    } catch (error) {
      console.log(error.message || error);
    }
  });

  socket.on("seenByMessage", async (data) => {
    console.log("seenByMessage >>>>>>>>>>>>>>", data);
    const user = users[String(socket.id)];
    await common.messageSeenBy(user, data);
    io.to(user).emit("seenByMessage", { status: 200, message: "seen by updated successfully" });
  });

});

process.on("sendNotificationToUser", async function (payloadData) {
  try {
    if (payloadData) {
      console.log('==', JSON.stringify(payloadData));
      payloadData.pushType = payloadData.pushType ? payloadData.pushType : 0;
      // let lang = payloadData.lang || "en";
      // let values = payloadData.values ? payloadData.values : {};

      // let inputKeysObj = constant.PUSH_TYPE[payloadData.pushType];
      // let data = await Utility.renderTemplateField(
      //   inputKeysObj,
      //   values,
      //   lang,
      //   payloadData
      // );

      io.to(payloadData.userId).emit('sendNotificationToUser', { "key": "Incoming call" });

      let user = await chatService.getUserDetail(payloadData.userId);
      let senderUser = await chatService.getUserDetail(payloadData.senderId);

      if(!senderUser){
        console.log('senderUser==========', payloadData.senderId);
      }

      payloadData.key = "Incoming call";
      // if (senderUser) {
      payloadData.senderId = {
        image: senderUser.image,
        fullName: (senderUser.firstName ? senderUser.firstName : '') + ' ' + (senderUser.lastName ? senderUser.lastName : ''),
        id: payloadData.senderId,
        tittle : "Incoming call",
        body :  "Incoming call"
      };
      // }
      console.log('qqqq  ', JSON.stringify(payloadData));
      await common.notificationAccDevice(user, payloadData);

    }
  } catch (error) {
    console.log(error.message || error);
  }
});


process.on("unreadNotificationCount", async (payload) => {
  payload = JSON.parse(JSON.stringify(payload));
  let socket = usersSockets[payload.to];
  if (socket) {
    console.log("Join notificationCount ", payload.to, socket.id);
    socket.join(payload.to);
  }
  console.log("notificationCount>>>>>>>>>>>>>>", payload.to, "---------------", payload);
  io.to(payload.to).emit("notificationCount", payload.count);
});

exports.io = io;