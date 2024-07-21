const FCM = require("fcm-node");
// const constant = require('./constant')
// const config = require("config");
// const Model = require('../models/index');
// const common = require('../v1/services/common')


async function sendNotification(data, fcmDeviceToken) {

    // let fcm = new FCM(config.get("fcm.android"));
    let fcm = new FCM(process.env.FCM_ANDRIOD);
    let deviceTokens = [];
    if (!Array.isArray(fcmDeviceToken)) {
        deviceTokens.push(fcmDeviceToken);
    } else {
        deviceTokens = fcmDeviceToken;
    }
    console.log("devixe", deviceTokens);
    try {
        let message = {
            registration_ids: deviceTokens,
            data: {
                ...data
            },
            notification: {
                // ...data
            }
        };
        fcm.send(message, function (err, response) {
            if (err) {
                console.error("error in notification", err);
                return { success: false, message: "Something went wrong" };
            } else {
                console.log("Successfully sent with response: ", response);
                return { success: true, message: "Notification sent successfully" };
            }
        });
        return { success: true };
    } catch (e) {
        console.log("e", e);
        return { success: false, message: "Something went wrong" };
    }

}

async function sendNotificationToIos(data, fcmDeviceToken) {
    try {

        // let fcm = new FCM(config.get("fcm.ios"));
        let fcm = new FCM(process.env.FCM_IOS);


        var message = {
            to: fcmDeviceToken || '',
            collapse_key: "psychologist",
            notification: {
                title: data.title || "",
                body: data.message || "",
                sound: "default"
            },
            data: data || {}
        };

        console.log("payload", message);

        fcm.send(message, (err) => {
            if (err) {
                console.log('Something has gone wrong!', err);
            } else {
                console.log('Push successfully sent!');
            }
        });
        console.log(data.userId, data.reactId);

    } catch (err) {
        console.log("err", err);
    }

}

module.exports = {
    sendNotificationToIos,
    sendNotification
};
