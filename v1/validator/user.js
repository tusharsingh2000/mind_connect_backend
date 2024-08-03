const joi = require("joi");
const constant = require("../../utility/constant");

const validateSchema = async (inputs, schema) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const { error } = schema.validate(inputs);
    if (error)
      throw error.details ? error.details[0].message.replace(/['"]+/g, "") : "";
    else return false;
  } catch (error) {
    throw error;
  }
};

// ***************************** ONBAORDING ******************************* //

const validateSignUp = async (req, property = "body") => {
  let schema = {};
  schema = joi.object().keys({
    key: joi.string().optional(),
    countryCode: joi.string().optional(),
    countryName: joi.string().optional(),
    // password: joi.string().optional(),
    role: joi
      .string()
      .valid(constant.USER_ROLE.USER, constant.USER_ROLE.CONSULTANT)
      .required(),
  });

  return await validateSchema(req[property], schema);
};

const validateVerifyOtp = async (req, property = "body") => {
  let schema = {};
  schema = joi.object().keys({
    key: joi.string().required(),
    code: joi.string().required(),
    countryCode: joi.string().optional(),
    countryName: joi.string().optional(),
    role: joi
      .string()
      .valid(constant.USER_ROLE.USER, constant.USER_ROLE.CONSULTANT)
      .required(),
  });
  return await validateSchema(req[property], schema);
};

const setPassword = async (req, property = "body") => {
  let schema = {};
  schema = joi.object().keys({
    password: joi.string().required(),
  });
  return await validateSchema(req[property], schema);
};

const socialLogin = async (req, property = "body") => {
  let schema = joi.object().keys({
    email: joi.string().optional(),
    phone: joi.string().optional(),
    image: joi.string().optional(),
    userName: joi.string().optional(),
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    countryCode: joi.string().optional(),
    countryName: joi.string().optional(),
    socialId: joi.string().required(),
    socialType: joi.string().optional().valid("FACEBOOK", "GOOGLE", "APPLE"),
    deviceType: joi.string().optional().valid("ANDROID", "IOS", "WEB"),
    role: joi
      .string()
      .valid(constant.USER_ROLE.USER, constant.USER_ROLE.CONSULTANT)
      .required(),
    deviceToken: joi
      .string()
      .when("deviceType", { is: "ANDROID", then: joi.string().optional() })
      .concat(
        joi
          .string()
          .when("deviceType", { is: "IOS", then: joi.string().optional() })
          .concat(
            joi.string().when("deviceType", {
              is: "WEB",
              then: joi.string().allow("", null).optional(),
            })
          )
      ),
  });
  return await validateSchema(req[property], schema);
};

const validateProfileUpdate = async (req, property = "body") => {
  // coming soon app
  let schema = joi.object().keys({
    email: joi.string().optional(),
    phone: joi.string().optional(),
    fullName: joi.string().optional(),
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    userName: joi.string().optional(),
    countryCode: joi.string().optional(),
    deviceType: joi.string().optional().valid("ANDROID", "IOS", "WEB"),
    deviceToken: joi.string().optional(),
    image: joi.string().optional(),
    latitude: joi.number().optional(),
    longitude: joi.number().optional(),
    isProfileComplete: joi.boolean().optional(),
    isNotificationEnable: joi.boolean().optional(),
    address: joi.string().optional(),
    zipCode: joi.string().allow("", null).optional(),
    dob: joi.string().optional(),
    coverImage: joi.string().optional(),
    password: joi.string().allow("", null).optional(),
    gender: joi.string().optional(),
    profileCompleteAt: joi.number().optional(),
    countryName: joi.string().optional(),
  });
  return await validateSchema(req[property], schema);
};

const validateLogIn = async (req, property = "body") => {
  let schema = {};
  schema = joi.object().keys({
    countryCode: joi.string().allow("", null).optional(),
    userName: joi.string().allow("", null).optional(),
    email: joi.string().allow("", null).optional(),
    role: joi.string().optional(),
    phone: joi
      .string()
      .regex(/^[0-9]+$/)
      .min(5)
      .optional(),
    password: joi.string().required(),
    deviceType: joi.string().optional().valid("ANDROID", "IOS", "WEB"),
    deviceToken: joi
      .string()
      .when("deviceType", { is: "ANDROID", then: joi.string().optional() })
      .concat(
        joi
          .string()
          .when("deviceType", { is: "IOS", then: joi.string().optional() })
          .concat(
            joi.string().when("deviceType", {
              is: "WEB",
              then: joi.string().allow("", null).optional(),
            })
          )
      ),
  });
  return await validateSchema(req[property], schema);
};

const validateChangePassword = async (req, property = "body", forReset) => {
  let schema = {};
  if (forReset) {
    schema = joi.object().keys({
      password: joi.string().required(),
    });
  } else {
    schema = joi.object().keys({
      oldPassword: joi.string().required(),
      password: joi.string().required(),
    });
  }
  return await validateSchema(req[property], schema);
};

//*********************************** DashBoard **************************************//
const validateDashBoard = async (req, property = "query") => {
  let schema = joi.object().keys({
    page: joi.number().optional(),
    limit: joi.number().optional(),
    timeZone: joi.string().required(),
  });
  return await validateSchema(req[property], schema);
};

const validateSlots = async (req, property = "body") => {
  let schema = {};
  schema = joi.object().keys({
    day: joi.string().optional(),
    openTime: joi.string().optional(),
    closeTime: joi.string().optional(),
    breakTime: joi.string().optional(),
  });

  return await validateSchema(req[property], schema);
};

module.exports = {
  validateSignUp,
  validateVerifyOtp,
  setPassword,
  validateProfileUpdate,
  socialLogin,
  validateLogIn,
  validateChangePassword,
  validateDashBoard,
  validateSlots,
};
