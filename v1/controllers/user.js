const validations = require("../validator/index");
const services = require("../services");
const response = require("../../utility/response");
const responseCode = require("../../utility/responseCode");
// const Utility = require("../../utility/Utility")
// const STATIC_PATHS = require("../../utility/constant");


//********************* OnBaording ***********************//

async function signup(req, res, next) {
  try {
    await validations.user.validateSignUp(req);
    let user = await services.user.createUser(req.body);
    return response.sendSuccessResponse(req, res, user, responseCode.CREATED, process.lang.SEND_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function logout(req, res, next) {
  try {
    let user = await services.user.logout(req);
    return response.sendSuccessResponse(req, res, user, responseCode.CREATED, process.lang.SEND_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function sendOtp(req, res, next) {
  try {
    let data = await services.user.sendOtp(req.body);
    if (data.phone == "") {
      return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.EMAIL_OTP_SEND_SUCCESSFULLY);
    }
    if (data.email == "") {
      return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.PHONE_NUMBER_OTP_SEND_SUCCESSFULLY);
    }
  } catch (error) {
    next(error);
  }
}
async function verifyOtp(req, res, next) {
  try {
    await validations.user.validateVerifyOtp(req);
    let data = await services.user.verifyOTP(req.body);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.SUCCESS);
  } catch (error) {
    next(error);
  }
}
async function setPassword(req, res, next) {
  try {
    await validations.user.setPassword(req);
    let data = await services.user.setPassword(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.PASSWORD_CHANGE_SUCCESS);
  } catch (error) {
    console.log(error);
    next(error);
  }
}
async function socialLogin(req, res, next) {
  try {
    await validations.user.socialLogin(req);
    let data = await services.user.socialLogin(req.body);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateprofile(req, res, next) {
  try {
    await validations.user.validateProfileUpdate(req);
    let data = await services.user.updateprofile(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    console.log(error);
    next(error);
  }
}
async function loginApp(req, res, next) {
  try {
    await validations.user.validateLogIn(req);
    let user = await services.user.login(req.body);
    return response.sendSuccessResponse(req, res, user, responseCode.CREATED, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function forgotpassword(req, res, next) {
  try {
    let user = await services.user.forgotpassword(req.body);
    return response.sendSuccessResponse(req, res, user, responseCode.OK, process.lang.OTP_SEND_SUCCESS);
  } catch (error) {
    next(error);
  }
}
async function changePassword(req, res, next) {
  try {
    await validations.user.validateChangePassword(req, "body", false);
    req.user.forResetPassword = false;
    let data = await services.user.changePassword(req.body, req.user);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

//***************************** File Upload ***********************************//

async function fileUpload(req, res, next) {
  try {
    return response.sendSuccessResponse(req, res, `${req.file.location}`, responseCode.OK); // for s3 bucket
    // return response.sendSuccessResponse(req, res, `/images/${req.file.filename}`, responseCode.OK); // for normal
  } catch (error) {
    next(error);
  }
}

//******************************* DashBoard *******************************//

async function dashboard(req, res, next) {
  try {
    // await validations.user.validateDashBoard(req);
    let data = await services.user.dashboard(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

//*********************** Notification ***************************//

async function notificationClear(req, res, next) {
  try {
    let data = await services.user.userClearNotification(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function userNotification(req, res, next) {
  try {
    let data = await services.user.userNotification(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}


//***************************** Education *****************************//
async function addEducation(req, res, next) {
  try {
    let data = await services.user.addEducation(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.ADD_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getEducation(req, res, next) {
  try {
    let data = await services.user.getEducation(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateEducation(req, res, next) {
  try {
    let data = await services.user.updateEducation(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteEducation(req, res, next) {
  try {
    let data = await services.user.deleteEducation(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}


//***************************** Experience *****************************//
async function addExperience(req, res, next) {
  try {
    let data = await services.user.addExperience(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.ADD_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getExperience(req, res, next) {
  try {
    let data = await services.user.getExperience(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateExperience(req, res, next) {
  try {
    let data = await services.user.updateExperience(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteExperience(req, res, next) {
  try {
    let data = await services.user.deleteExperience(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}


//***************************** Address *****************************//
async function addAddress(req, res, next) {
  try {
    let data = await services.user.addAddress(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.ADD_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getAddress(req, res, next) {
  try {
    let data = await services.user.getAddress(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateAddress(req, res, next) {
  try {
    let data = await services.user.updateAddress(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteAddress(req, res, next) {
  try {
    let data = await services.user.deleteAddress(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}


//***************************** Document *****************************//
async function addDocument(req, res, next) {
  try {
    let data = await services.user.addDocument(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.ADD_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getDocument(req, res, next) {
  try {
    let data = await services.user.getDocument(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateDocument(req, res, next) {
  try {
    let data = await services.user.updateDocument(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteDocument(req, res, next) {
  try {
    let data = await services.user.deleteDocument(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

//***************************** Slots *****************************//
async function addSlots(req, res, next) {
  try {
    await validations.user.validateSlots(req);
    let data = await services.user.addSlots(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.ADD_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getSlots(req, res, next) {
  try {
    let data = await services.user.getSlots(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateSlots(req, res, next) {
  try {
    let data = await services.user.updateSlots(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteSlots(req, res, next) {
  try {
    let data = await services.user.deleteSlots(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

async function getCategory(req, res, next) {
  try {
    let data = await services.user.getCategory(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

async function getBanner(req, res, next) {
  try {
    let data = await services.user.getBanner(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

async function serviceProviderDetail(req, res, next) {
  try {
    let data = await services.user.serviceProviderDetail(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getBanner,
  serviceProviderDetail,
  
  addSlots,
  getSlots,
  updateSlots,
  deleteSlots,

  getCategory,

  addDocument,
  getDocument,
  updateDocument,
  deleteDocument,

  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,

  addExperience,
  getExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  getEducation,
  updateEducation,
  deleteEducation,
  notificationClear,
  logout,
  signup,
  verifyOtp,
  setPassword,
  socialLogin,
  updateprofile,
  fileUpload,
  loginApp,
  forgotpassword,
  changePassword,
  dashboard,
  userNotification,
  sendOtp

};
