// const twilio = require("twilio")
// const config = require("config")

// // var accountSid = process.env.TWILIO_ACCOUNT_SID; 
// // var authToken = process.env.TWILIO_AUTH_TOKEN;   

// // var accountSid = config.get("twilio.TWILIO_ACCOUNT_SID")
// // var authToken = config.get("twilio.TWILIO_AUTH_TOKEN")

// // console.log("twillio", accountSid)
// const client = twilio(accountSid, authToken, {
//   lazyLoading: true
// })

// const sendSMSTwillo=async (countryCode,phoneNo,message)=>{
//  const smsOptions = {
//           from: config.get("twilio.number") ,
//           to: (countryCode?countryCode:'') + (phoneNo?phoneNo.toString():''),
//           body: null,
//         };
//         smsOptions.body = message;
//         console.log("smsOptions",smsOptions)
//       client.messages.create(smsOptions).then(call => console.log("sending sms "))
//       .catch(error => console.log(error))
// };

// module.exports = {
//   sendSMSTwillo :  sendSMSTwillo
// }