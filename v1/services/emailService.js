const emailService = require("../../utility/Email");


async function sendOtpEmail(email, firstName, code) {
    const subject = "psychologist Account verification";
    let html = 'Your One Time OTP is ' + code;
    await emailService.sendEmail(email, subject, html);
}



async function sendEmailForAccountBlock(email, msg) {
    const subject = "Account Block";
    await emailService.sendEmail(email, subject, msg);
}

module.exports = {
    sendOtpEmail,
    sendEmailForAccountBlock
};
