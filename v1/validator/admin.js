const joi = require('joi');

const validateSchema = async (inputs, schema) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const { error } = schema.validate(inputs);
        if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, '') : "";
        else return false;
    } catch (error) { throw error; }
};



//********************************** ONBOARDING **************************************//

const validateSignUp = async (req, property = 'body') => {
    let schema = {};
    schema = joi.object().keys({
        phone: joi.string().optional(),
        email: joi.string().optional(),
        countryCode: joi.string().allow("", null).optional(),
        password: joi.string().required(),
        name: joi.string().optional()
    });

    return await validateSchema(req[property], schema);
};

const validateLogIn = async (req, property = 'body') => {
    let schema = {};

    schema = joi.object().keys({
        countryCode: joi.string().allow('', null).optional(),
        key: joi.string().required(),
        password: joi.string().required(),
        deviceType: joi.string().optional().valid("ANDROID", "IOS", "WEB"),
        deviceToken: joi.string()
            .when('deviceType', { is: "ANDROID", then: joi.string().optional() })
            .concat(joi.string().when('deviceType', { is: "IOS", then: joi.string().optional() })
                .concat(joi.string().when('deviceType', { is: "WEB", then: joi.string().allow('', null).optional() })))
    });
    return await validateSchema(req[property], schema);
};

const validateResetPassword = async (req, property = 'body') => {
    let schema = joi.object().keys({
        key: joi.string().optional(),
        phone: joi.string().optional(),
        email: joi.string().optional(),
        countryCode: joi.string().optional()
    });
    return await validateSchema(req[property], schema);
};

const validateOtpVerify = async (req, property = 'body') => {
    let schema = joi.object().keys({
        key: joi.string().required(),
        code: joi.string().required(),
        countryCode: joi.string().allow("", null).optional()
    });
    return await validateSchema(req[property], schema);
};

const validateChangePassword = async (req, property = 'body', forReset) => {
    let schema = {};
    if (forReset) {
        schema = joi.object().keys({
            password: joi.string().required()
        });
    } else {
        schema = joi.object().keys({
            oldPassword: joi.string().required(),
            password: joi.string().required()
        });
    }
    return await validateSchema(req[property], schema);
};

const validateProfileUpdate = async (req, property = 'body') => {
    let schema = joi.object().keys({
        email: joi.string().optional(),
        phone: joi.string().optional(),
        image: joi.string().optional(),
        firstName: joi.string().optional(),
        lastName: joi.string().optional(),
        name: joi.string().optional(),
        countryCode: joi.string().optional(),
        deviceType: joi.string().optional().valid("ANDROID", "IOS", "WEB"),
        deviceToken: joi.string().optional(),
        address: joi.string().optional(),
        latitude: joi.number().optional(),
        longitude: joi.number().optional()
    });
    return await validateSchema(req[property], schema);
};



//******************************** SUBADMIN ******************************************//

const validateSubadmin = async (req, property = 'body') => {
    let schema = joi.object().keys({
        email: joi.string().optional(),
        name: joi.string().optional(),
        countryCode: joi.string().optional(),
        phone: joi.string().optional(),
        address: joi.string().optional(),
        password: joi.string().optional(),
        image: joi.string().optional(),
        latitude: joi.number().optional(),
        longitude: joi.number().optional(),
        roleType: joi.string().required().optional(),
        userEdit: joi.boolean().required(),
        userView: joi.boolean().required(),
        contentEdit: joi.boolean().required(),
        contentView: joi.boolean().required(),
        notificationEdit: joi.boolean().required(),
        notificationView: joi.boolean().required(),
        cmsEdit: joi.boolean().required(),
        cmsView: joi.boolean().required(),
        commentEdit: joi.boolean().required(),
        commentView: joi.boolean().required()

    });
    return await validateSchema(req[property], schema);
};


//******************************* Notification ***********************************//
const addNotification = async (req, property = 'body') => {
    let schema = joi.object().keys({
        type: joi.string().valid('All', 'User', 'SubAdmin').required(),
        notificationType: joi.number().valid('Activity', 'Broadcast', 'Content').required(),
        tittle: joi.string().required(),
        message: joi.string().required()
    });
    return await validateSchema(req[property], schema);
};

//*************************** Faq *********************************//

const faq = async (req, property = 'body') => {
    let schema = joi.object().keys({
        answer: joi.string().required(),
        question: joi.string().required()
    });
    return await validateSchema(req[property], schema);
};
module.exports = {
    addNotification,
    validateLogIn,
    validateResetPassword,
    validateOtpVerify,
    validateChangePassword,
    validateProfileUpdate,
    validateSignUp,
    validateSubadmin,
    faq
};