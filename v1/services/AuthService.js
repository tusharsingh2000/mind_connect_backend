const response = require("../../utility/response");
const Utility = require("../../utility/Utility");
const responseCode = require("../../utility/responseCode");
const messages = require("../../messages/messages").MESSAGES;
const Model = require("../../models");
const mongoose = require("mongoose");

const userAuth = async (req, res, next) => {
  try {
    if (req && req.user && req.user.guestMode) {
      next();
    } else if (req && req.headers.authorization) {
      const accessTokenFull = req.headers.authorization;
      let accessToken = "";
      if (accessTokenFull.startsWith("Bearer")) {
        accessToken = accessTokenFull.substr("Bearer".length + 1);
      } else {
        const parts = accessTokenFull.split(" ");
        accessToken = parts[1];
      }
      const decodeData = await Utility.jwtVerify(accessToken);
      if (!decodeData) throw process.lang.INVALID_TOKEN;
      const userData = await Model.user
        .findOne({ _id: decodeData._id })
        .lean()
        .exec();
      if (userData) {
        // if (
        //   userData.role == "consultant" &&
        //   userData.isProfileComplete == true &&
        //   userData.isVerified == false
        // ) {
        //   return response.sendFailResponse(
        //     req,
        //     res,
        //     responseCode.UN_AUTHORIZED,
        //     process.lang.ACCOUNT_UN_VERIFIED
        //   );
        // }
        req.user = userData;
        req.user.forResetPassword = decodeData.forResetPassword;
        req.user.userType = "USER";
        next();
      } else {
        return response.sendFailResponse(
          req,
          res,
          responseCode.UN_AUTHORIZED,
          process.lang.INVALID_TOKEN
        );
      }
    } else {
      return response.sendFailResponse(
        req,
        res,
        responseCode.UN_AUTHORIZED,
        process.lang.AUTH_TOKEN_MISSING
      );
    }
  } catch (error) {
    next(error);
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (req.admin && req.admin.guestMode) {
      next();
    } else if (req.headers.authorization) {
      let accessToken = req.headers.authorization;
      if (accessToken.startsWith("Bearer")) {
        accessToken = accessToken.substr("Bearer".length + 1);
      }
      const decodeData = await Utility.jwtVerify(accessToken);
      if (!decodeData) throw messages.INVALID_TOKEN;
      const adminData = await Model.admin
        .findOne({ _id: mongoose.Types.ObjectId(decodeData._id) })
        .lean()
        .exec();
      if (adminData) {
        req.admin = adminData;
        req.admin.forResetPassword = decodeData.forResetPassword;
        req.admin.adminType = "ADMIN";
        next();
      } else {
        return response.sendFailResponse(
          req,
          res,
          responseCode.UN_AUTHORIZED,
          process.lang.INVALID_TOKEN
        );
      }
    } else {
      return response.sendFailResponse(
        req,
        res,
        responseCode.UN_AUTHORIZED,
        process.lang.AUTH_TOKEN_MISSING
      );
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userAuth,
  adminAuth,
};
