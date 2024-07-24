const Model = require('../../models');
const moment = require('moment');
// const Utility = require('../../utility/Utility')
const emailService = require('../services/emailService');
const mongoose = require('mongoose');
//const emailService = require("./EmailService")
// const smsService = require("./SMSService")


// async function generatePhoneOtp(countryCode, phone, user, otpCode = Utility.generateRandom(4), expiredAt = moment().add(10, 'minutes').toDate()) {
async function generatePhoneOtp(countryCode, phone, user, otpCode = '123456', expiredAt = moment().add(5, 'minutes').toDate()) {
    await Model.otp.deleteMany({
        phone: phone, countryCode: countryCode
    }); //Clear Old Send otp message
    let data = {
        phone: phone,
        countryCode: countryCode,
        code: otpCode,
        expiredAt: expiredAt
    };
    if (user) {
        data.userId = user._id;
    }
    // await smsService.sendSMSTwillo(countryCode, phone, otpCode + " is your psychologist verification code.")
    let otp = await Model.otp.create(data);
    return otp;
}

// async function generateEmailVerification(email, user, code = Utility.generateRandom(4), expiredAt = moment().add(60, 'minutes').toDate()) {
async function generateEmailVerification(email, user, code = '123456', expiredAt = moment().add(60, 'minutes').toDate()) {

    console.log('email: ', email);
    email = email.toLowerCase();
    await Model.otp.deleteMany({
        email: email
    }); //Clear Old Send otp message
    let data = {
        email: email,
        code: code,
        expiredAt: expiredAt
    };
    if (!data.code) {
        // data.code = Utility.generateRandom(6);
        data.code = '123456';
    }
    if (user) {
        data.userId = user._id;
    }
    let otp = await Model.otp.create(data);

    if (user) {
         emailService.sendOtpEmail(email, user.firstName, otp.code);
    } else {
         emailService.sendOtpEmail(email, "", otp.code);
    }

    return otp;
}

async function verifyEmailCode(email, code, removeOtp = true) {
    return await verifyPhoneOtp(null, email, code, removeOtp, true);
}

async function verifyPhoneOtp(countryCode, key, otpCode, removeOtp = true, isForEmail = false, userId) {
    let qry = {
        code: otpCode,
        expiredAt: {
            $gte: new Date()
        }
    };
    if (isForEmail) {
        qry.email = key.toLowerCase();
    } else {
        qry.phone = key;
    }
    // console.log('qry: ', qry);
    if (userId) {
        qry.userId = mongoose.Types.ObjectId(userId);
    }
    if (countryCode) {
        qry.countryCode = countryCode;
    }
    let otp = await Model.otp.findOne(qry, { _id: 1 });
    console.log('otp: ', otp);
    if (otp && removeOtp) {
        otp.remove();
    }
    return otp;
}



module.exports = {
    generatePhoneOtp,
    generateEmailVerification,
    verifyPhoneOtp,
    verifyEmailCode
};