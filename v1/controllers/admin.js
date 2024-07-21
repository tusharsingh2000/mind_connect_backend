const validations = require("../validator/index");
const services = require("../services");
const response = require("../../utility/response");
const responseCode = require("../../utility/responseCode");


//************************** OnBoarding **********************//
async function signup(req, res, next) {
  try {
    await validations.admin.validateSignUp(req);
    if (!req.body.email && !req.body.phone) {
      return response.sendFailResponse(req, res, responseCode.BAD_REQUEST, process.lang.REQUIRED_FILED_IS_MISSING);
    }
    let admin = await services.admin.createAdmin(req.body);
    return response.sendSuccessResponse(req, res, admin, responseCode.CREATED);
  } catch (error) {
    next(error);
  }
}
async function login(req, res, next) {
  try {
    await validations.admin.validateLogIn(req);
    let admin = await services.admin.login(req.body);
    return response.sendSuccessResponse(req, res, admin, responseCode.OK, process.lang.SUCCESS);
  } catch (error) {
    next(error);
  }
}
async function forgotPassword(req, res, next) {
  try {
    await validations.admin.validateResetPassword(req);
    await services.admin.resetPassword(req.body);
    return response.sendSuccessResponse(req, res, null, responseCode.OK, process.lang.OTP_SEND_SUCCESS);
  } catch (error) {
    next(error);
  }
}
async function verifyOtp(req, res, next) {
  try {
    await validations.admin.validateOtpVerify(req);
    let data = await services.admin.verifyOtp(req.body);
    return response.sendSuccessResponse(req, res, data, responseCode.OK);
  } catch (error) {
    next(error);
  }
}
async function setPassword(req, res, next) {
  try {
    await validations.admin.validateChangePassword(req, "body", true);
    req.admin.forResetPassword = true;
    let data = await services.admin.changePassword(req.body, req.admin);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.PASSWORD_CHANGE_SUCCESS);
  } catch (error) {
    next(error);
  }
}
async function changePassword(req, res, next) {
  try {
    await validations.admin.validateChangePassword(req, "body", false);
    req.admin.forResetPassword = false;
    let data = await services.admin.changePassword(req.body, req.admin);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateProfile(req, res, next) {
  try {
    await validations.admin.validateProfileUpdate(req);
    let data = await services.admin.updateProfile(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getProfile(req, res, next) {
  try {
    let data = await services.admin.getProfile(req.admin);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}


// ****************************** DashBaord *****************************//
async function getDashboard(req, res, next) {
  try {
    let data = await services.admin.getDashboard(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

//***************************** SubAdmin *****************************//
async function addSubadmin(req, res, next) {
  try {

    await validations.admin.validateSubadmin(req);

    let data = await services.admin.addSubAdmin(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.ADD_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getSubadmin(req, res, next) {
  try {
    let data = await services.admin.getSubAdmin(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateSubadmin(req, res, next) {
  try {
    await validations.admin.validateSubadmin(req);
    let data = await services.admin.updateSubAdmin(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteSubadmin(req, res, next) {
  try {
    let data = await services.admin.deleteSubAdmin(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

//******************************** CMS *******************************//
async function addCms(req, res, next) {
  try {
    let data = await services.admin.addCms(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.CREATE_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateCms(req, res, next) {
  try {
    let data = await services.admin.updateCms(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getCms(req, res, next) {
  try {
    let data = await services.admin.getCms(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

//***************************** Account Verifed **************************************//
async function accountVerified(req, res, next) {
  try {
    let data = await services.admin.accountVerified(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getAccountVerified(req, res, next) {
  try {
    let data = await services.admin.getAccountVerified(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}

//********************************* FAQ ************************************//

async function addFaq(req, res, next) {
  try {
    let data = await services.admin.addFaq(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.CREATE_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateFaq(req, res, next) {
  try {
    await validations.admin.faq(req);
    let data = await services.admin.updateFaq(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteFaq(req, res, next) {
  try {
    let data = await services.admin.deleteFaq(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getFaq(req, res, next) {
  try {
    let data = await services.admin.getFaq(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}



//***************************** Category *****************************//
async function addCategory(req, res, next) {
  try {
    let data = await services.admin.addCategory(req);
    return response.sendSuccessResponse(req, res, data, responseCode.CREATED, process.lang.ADD_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function getCategory(req, res, next) {
  try {
    let data = await services.admin.getCategory(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.FETCH_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function updateCategory(req, res, next) {
  try {
    let data = await services.admin.updateCategory(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.UPDATED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}
async function deleteCategory(req, res, next) {
  try {
    let data = await services.admin.deleteCategory(req);
    return response.sendSuccessResponse(req, res, data, responseCode.OK, process.lang.DELETED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
}


module.exports = {
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  addFaq,
  updateFaq,
  deleteFaq,
  getFaq,
  accountVerified,
  getAccountVerified,
  signup,
  login,
  forgotPassword,
  verifyOtp,
  setPassword,
  updateProfile,
  getProfile,
  changePassword,
  addSubadmin,
  getSubadmin,
  updateSubadmin,
  deleteSubadmin,
  addCms,
  updateCms,
  getCms,
  getDashboard
};
