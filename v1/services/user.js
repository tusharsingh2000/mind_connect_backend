const Model = require("../../models");
const responseCode = require("../../utility/responseCode");
const Otp = require("../services/otp");
const utility = require("../../utility/Utility");
const mongoose = require("mongoose");
// const emailServices = require("./emailService");
const common = require("./common");
// const moment = require("moment");
// const moment = require('moment-timezone');
// const constant = require("../../utility/constant");
// const notification = require('../../utility/pushNotifications');

const ObjectId = mongoose.Types.ObjectId;

//********************************** OnBoarding *********************************//
async function createUser(data) {
    let user;

    if (utility.isEmail(data.key)) {
        data.email = data.key;
        user = await Model.user.findOne({
            email: data.email,
            isEmailVerify: true,
            isDeleted: false,
            role: data.role
        });
        if (!user) {
            user = await Model.user.findOne({
                email: data.email,
                isDeleted: false,
                role: data.role
            });
            if (user) {
                await Model.user.deleteMany({
                    email: data.email,
                    isDeleted: false,
                    isEmailVerify: false,
                    role: data.role
                });
            }
            user = await Model.user.create(data);
        }
        Otp.generateEmailVerification(data.email, data);
    } else {
        data.phone = data.key;
        user = await Model.user.findOne({
            phone: data.phone,
            countryCode: data.countryCode,
            isPhoneVerify: true,
            isDeleted: false,
            role: data.role
        });
        if (!user) {
            user = await Model.user.findOne({
                phone: data.phone,
                countryCode: data.countryCode,
                isDeleted: false,
                role: data.role
            });
            if (user) {
                await Model.user.deleteMany({
                    phone: data.phone,
                    countryCode: data.countryCode,
                    isDeleted: false,
                    isPhoneVerify: false,
                    role: data.role
                });
            }
            user = await Model.user.create(data);
        }
        Otp.generatePhoneOtp(data.countryCode, data.phone, user);
    }
    if (!user) {
        throw responseCode.BAD_REQUEST;
    }
    return user;
}
async function setPassword(req) {
    await Model.user.findByIdAndUpdate(req.user._id, {
        $set: {
            password: await utility.hashPasswordUsingBcrypt(req.body.password)
        }
    });
    return {};
}
async function logout(req) {
    return await Model.user.findOneAndUpdate(
        { _id: ObjectId(req.user._id), isDeleted: false },
        { $set: { deviceType: "", deviceToken: "" } },
        { new: true }
    );
}
async function verifyOTP(data) {
    let user;
    let setObj = {};

    if (utility.isEmail(data.key)) {
        data.email = data.key;
        user = await Model.user.findOne({
            email: data.email,
            isDeleted: false,
            role: data.role
        });
        let otp = await Otp.verifyEmailCode(data.email, data.code);
        if (!otp) throw process.lang.INVALID_OTP;
        setObj.isEmailVerify = true;
    } else {
        data.phone = data.key;
        user = await Model.user.findOne({
            countryCode: data.countryCode,
            phone: data.phone,
            isDeleted: false,
            role: data.role
        });
        let otp = await Otp.verifyPhoneOtp(data.countryCode, data.phone, data.code);
        if (!otp) throw process.lang.INVALID_OTP;
        setObj.isPhoneVerify = true;
    }

    let jti = utility.generateRandomString(20);
    setObj.jti = jti;
    user = await Model.user
        .findOneAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, setObj)
        .lean();
    user = await Model.user
        .findOne({ _id: mongoose.Types.ObjectId(user._id) })
        .lean();
    user.token = await utility.jwtSign({
        _id: user._id,
        role: user.role,
        jti: jti
    });
    user.type = "Bearer";
    user.expire = await utility.getJwtExpireTime();
    user.refreshToken = await utility.jwtRefreshSign({ _id: user._id });

    return user;
}
async function sendOtp(data) {
    // *********** Encode Decode ***********//
    let otp;
    if (utility.isEmail(data.key)) {
        data.email = data.key;
        otp = await Otp.generateEmailVerification(data.email, data);
        return otp;
    } else {
        data.phone = data.key;
        otp = await Otp.generatePhoneOtp(data.countryCode, data.phone, data);
        return otp;
    }
}
async function checkDuplicateUser(data) {
    let qry = {
        isDeleted: false,
        role: data.role
    };

    let or = [];
    if (data.email) {
        or.push({
            email: data.email.toLowerCase()
        });
    }
    if (data.phone) {
        or.push({
            phone: data.phone
        });
    }
    if (data.userName) {
        or.push({
            userName: data.userName
        });
    }
    qry.$or = or;
    let user;
    if (or.length > 0) {
        user = await Model.user.findOne(qry, {
            email: 1,
            phone: 1,
            userName: 1
        });

        if (user) {
            if (user.email == data.email.toLowerCase()) {
                throw process.lang.DUPLICATE_EMAIL;
            }
            if (user.phone == data.phone) {
                throw process.lang.DUPLICATE_PHONE;
            }
        }
    }
    return user;
}
async function socialLogin(data) {
    let qry = {
        isDeleted: false,
        role: data.role
    };

    let user = await Model.user.findOne({
        socialId: data.socialId,
        socialType: data.socialType,
        isDeleted: false,
        role: data.role
    });

    if (!user) {
        if (utility.isEmail(data.email)) {
            qry.email = data.email.toLowerCase();
        } else {
            qry.phone = data.phone;
            qry.countryCode = data.countryCode;
        }

        user = await Model.user.findOne(qry);
        if (!user) {
            data.isSocialLogin = true;
            await checkDuplicateUser(data);

            if (utility.isEmail(data.email)) {
                data.isEmailVerify = true;
                data.verificationType = 1;
            }
            if (data.phone) {
                data.isPhoneVerify = true;
                data.verificationType = 0;
            }
            user = await Model.user.create(data);
        } else {
            await Model.user.findByIdAndUpdate(user._id, {
                $set: {
                    socialId: data.socialId,
                    socialType: data.socialType
                }
            });
        }
    }
    if (user) {
        user = await Model.user.findOne({ _id: user._id });
    }
    user = await _doLogin(user, data);
    return user;
}
async function _doLogin(user, data) {
    let setObj = {
        deviceType: data.deviceType,
        deviceToken: data.deviceToken
    };
    if (user) {
        user = JSON.parse(JSON.stringify(user));
    }

    if (user.isBlocked) {
        throw process.lang.USER_IS_BLOCKED;
    }

    let jti = utility.generateRandomString(20);
    setObj.jti = jti;
    user = await Model.user
        .findByIdAndUpdate({ _id: user._id }, { $set: setObj })
        .lean();
    user.token = await utility.jwtSign({
        _id: user._id,
        role: user.role,
        jti: jti,
        email: user.email
    });
    user.type = "Bearer";
    user.expire = await utility.getJwtExpireTime();
    user.refreshToken = await utility.jwtRefreshSign({ _id: user._id });
    return user;
}
async function updateprofile(req) {
    let data = req.body;
    if (data.password) {
        data.password = await utility.hashPasswordUsingBcrypt(data.password);
    }
    let user;
    if (req.body.email) {
        user = await Model.user
            .findOne({
                email: req.body.email,
                isDeleted: false,
                role: req.user.role,
                _id: { $ne: ObjectId(req.user._id) }
            })
            .lean();
        if (user) throw process.lang.DUPLICATE_EMAIL;
    }

    if (req.body.phone) {
        user = await Model.user
            .findOne({
                phone: req.body.phone,
                isDeleted: false,
                role: req.user.role,
                _id: { $ne: ObjectId(req.user._id) }
            })
            .lean();
        if (user) throw process.lang.DUPLICATE_PHONE;
    }

    // user = await Model.user.findOne({ userName: req.body.userName, isDeleted: false, _id: { $ne: ObjectId(req.user._id) } }).lean();
    // if (user) throw process.lang.DUPLICATE_USERNAME;

    return await Model.user.findOneAndUpdate({ _id: req.user._id }, data, {
        new: true
    });
}
async function getprofile(req) {
    let user;
    if (req.user._id) {
        user = await Model.user
            .findOne({
                isDeleted: false,
                _id: ObjectId(req.user._id)
            })
            .lean();
    }
    if (user) {
        return user;
    }
    return null;
}

async function getProfileDetail(req) {
    let user = await Model.user.aggregate([
        { $match: { role: 'consultant', isDeleted: false, _id: req.user._id } },
        {
            $lookup: {
                from: 'experiences',
                let: { id: "$_id" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$$id", "$userId"]
                        },
                        isDeleted: false
                    }
                },{
                    $lookup: {
                        from: "categories",
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryId"
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0
                    }}],
                as: 'experiences'
            }
        },
        {
            $lookup: {
                from: 'educations',
                let: { id: "$_id" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$$id", "$userId"]
                        },
                        isDeleted: false
                    }
                }],
                as: 'educations'
            }
        },
        // {
        //     $lookup: {
        //         from: "categories",
        //         localField: "categoryId",
        //         foreignField: "_id",
        //         as: "categories"
        //     }
        // },
        // {
        //     $lookup: {
        //         from: 'categories',
        //         let: { id: "$_id" },
        //         pipeline: [{
        //             $match: {
        //                 $expr: {
        //                     $eq: ["$$id", "$userId"]
        //                 },
        //                 isDeleted: false
        //             }
        //         }],
        //         as: 'categories'
        //     }
        // },
        {
            $lookup: {
                from: 'documents',
                let: { id: "$_id" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$$id", "$userId"]
                        },
                        isDeleted: false
                    }
                }],
                as: 'documents'
            }
        }
    ]);
    return user;
}

async function login(data) {
    let planPassword = data.password;
    delete data.password;
    let qry = {
        isDeleted: false,
        role: data.role
    };

    if (utility.isEmail(data.email)) {
        qry.email = data.email;
    } else if (utility.isPhone(data.phone)) {
        qry.phone = data.phone;

        if (data.countryCode) qry.countryCode = data.countryCode;
    } else {
        qry.userName = data.userName;
    }
    let user = await Model.user.findOne(qry, {
        password: 1,
        role: 1,
        isBlocked: 1
    });
    if (!user) {
        throw process.lang.INVALID_CREDENTAILS;
    }
    let match = await utility.comparePasswordUsingBcrypt(
        planPassword,
        user.password
    );
    if (!match) {
        throw process.lang.INVALID_CREDENTAILS;
    }
    if (user) {
        user = await Model.user.findOne({ _id: user._id });
    }
    user = await _doLogin(user, data);
    return user;
}
async function forgotpassword(data) {
    if ((data.key && utility.isEmail(data.key)) || data.email) {
        let email = data.key || data.email;
        let user = await Model.user.findOne({
            email: email.toLowerCase(),
            isDeleted: false
        });
        if (!user) {
            throw process.lang.INVALID_EMAIL;
        }
        let otp = await Otp.generateEmailVerification(user.email, user);
        if (!otp) {
            throw process.lang.REQUIRED_FILED_IS_MISSING;
        }
        return {
            verificationType: 1
        };
    } else if ((data.key && utility.isPhone(data.key)) || data.phone) {
        let phone = data.key || data.phone;
        let user = await Model.user.findOne({ phone: phone, isDeleted: false });
        if (!user) {
            throw process.lang.INVALID_PHONE;
        }
        let otp = await Otp.generatePhoneOtp(user.countryCode, phone);
        if (!otp) {
            throw process.lang.REQUIRED_FILED_IS_MISSING;
        }
        return {
            verificationType: 1
        };
    } else {
        throw process.lang.REQUIRED_FILED_IS_MISSING;
    }
}
async function changePassword(data, user) {
    if (!user.forResetPassword) {
        let findadmin = await Model.user.findOne(
            { _id: user._id },
            {
                password: 1
            }
        );
        if (!findadmin) {
            throw process.lang.INVALID_CREDENTAILS;
        } else {
            let match = await utility.comparePasswordUsingBcrypt(
                data.oldPassword,
                findadmin.password
            );
            if (!match) {
                throw process.lang.OLD_PASS_NOT_MATCH;
            }
        }
    }
    await Model.user.findByIdAndUpdate(user._id, {
        $set: {
            password: await utility.hashPasswordUsingBcrypt(data.password)
        }
    });
    return {};
}

//************************* DashBoard *********************************//
async function dashboard(req) {

    let page = req.query.page;
    let size = req.query.limit;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 50;
    skip = skip * limit;

    let pipeline = [];
    if (req.query.categoryId) {
        pipeline.push({ $match: { categoryId: { $in: [req.query.categoryId] } } });
    }
    pipeline.push({ $match: { role: 'consultant', isDeleted: false, isProfileComplete: true } },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryId"
            }
        },
        {
            $lookup: {
                from: 'experiences',
                let: { id: "$_id" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$$id", "$userId"]
                        },
                        isDeleted: false
                    }
                }, {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0
                    }
                }],
                as: 'experiences'
            }
        },
        {
            $lookup: {
                from: 'educations',
                let: { id: "$_id" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$$id", "$userId"]
                        },
                        isDeleted: false
                    }
                }, {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0
                    }
                }],
                as: 'educations'
            }
        },
        // {
        //   $lookup: {
        //     from: "ratings",
        //     localField: "classes._id",
        //     foreignField: "classId",
        //     as: "rating",
        //   },
        // },
        // { $addFields: { ratingCount: { $size: "$rating" } } },
        // { $addFields: { avgRating: { $avg: "$rating.rating" } } }
        {
            $project: {
                name: 1,
                image: 1,
                role: 1,
                fullName: 1,
                lastName: 1,
                phone: 1,
                categoryId: 1,
                countryCode: 1,
                email: 1,
                educations: 1,
                experiences: 1,
                coverImage: 1
            }
        }
    );
    pipeline = await common.pagination(pipeline, skip, limit);
    let [sps] = await Model.user.aggregate(pipeline);

    let setting = await Model.setting.findOne({ isDeleted: false }).select("-createdAt -updatedAt");
    sps.setting = setting;
    return sps;

}

async function serviceProviderDetail(req) {
    let page = req.query.page;
    let size = req.query.limit;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 50;
    skip = skip * limit;

    let pipeline = [];
    if (req.query.categoryId) {
        pipeline.push({ $match: { categoryId: { $in: [req.query.categoryId] } } });
    }
    pipeline.push({ $match: { role: 'consultant', isDeleted: false, userId: ObjectId(req.user._id) } },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryId"
            }
        },
        {
            $lookup: {
                from: 'experiences',
                let: { id: "$_id" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$$id", "$userId"]
                        },
                        isDeleted: false
                    }
                }],
                as: 'experiences'
            }
        },
        {
            $lookup: {
                from: 'educations',
                let: { id: "$_id" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$$id", "$userId"]
                        },
                        isDeleted: false
                    }
                }],
                as: 'educations'
            }
        },
        // { $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true } },
        // {
        //   $lookup: {
        //     from: "ratings",
        //     localField: "classes._id",
        //     foreignField: "classId",
        //     as: "rating",
        //   },
        // },
        // { $addFields: { ratingCount: { $size: "$rating" } } },
        // { $addFields: { avgRating: { $avg: "$rating.rating" } } }
        {
            $project: {
                name: 1,
                image: 1,
                role: 1,
                fullName: 1,
                lastName: 1,
                phone: 1,
                categoryId: 1,
                countryCode: 1,
                email: 1,
                educations: 1,
                experiences: 1
            }
        }
    );
    pipeline = await common.pagination(pipeline, skip, limit);
    let [sps] = await Model.user.aggregate(pipeline);
    return sps;
}

//****************************** Notification ***************************************//

async function userNotification(req) {
    let page = req.query.page;
    let size = req.query.limit;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 10;
    skip = skip * limit;

    let old = await Model.notification
        .find({ isDeleted: false, isRead: true, userId: ObjectId(req.user._id) })
        .sort({ createdAt: -1 });
    let newNoti = await Model.notification
        .find({
            isDeleted: false,
            isRead: false,
            userId: ObjectId(req.user._id)
        })
        .populate("userId reactId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    let count = await Model.notification.countDocuments({
        isDeleted: false,
        isRead: false,
        userId: ObjectId(req.user._id)
    });

    await Model.notification.updateMany(
        { isDeleted: false, isRead: false, userId: ObjectId(req.user._id) },
        { $set: { isRead: true } }
    );
    return { old: old, new: newNoti, count: count };
}
async function userClearNotification(req) {
    let notification = await Model.notification.updateMany(
        { userId: req.user._id, isDeleted: false },
        { $set: { isDeleted: true } }
    );
    return notification;
}

//***************************** Education ***********************************//

async function addEducation(req) {
    req.body.userId = req.user._id;
    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    return await Model.education.create(req.body);
}

async function getEducation(req) {
    let page = req.query.page;
    let size = req.query.size;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 10;
    skip = skip * limit;
    let qry = { isDeleted: false, userId: ObjectId(req.user._id) };

    let education;
    if (req.params.id) {
        education = await Model.education
            .findOne({ _id: ObjectId(req.params.id), ...qry })
            .select("-createdAt -updatedAt"); //.populate("userId");
    } else {
        let pipeline = [];
        pipeline.push({
            $match: { isDeleted: false, userId: ObjectId(req.user._id) }
        });
        pipeline = await common.pagination(pipeline, skip, limit);
        [education] = await Model.education.aggregate(pipeline);
    }
    return education;
}

async function updateEducation(req) {
    let education = await Model.education.findOne({
        _id: req.params.id,
        isDeleted: false,
        userId: ObjectId(req.user._id)
    });
    if (!education) throw process.lang.INVALID_ID;

    education = await Model.education.findByIdAndUpdate(
        { _id: education._id },
        req.body,
        { new: true }
    );
    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    return education;
}

async function deleteEducation(req) {
    let education = await Model.education
        .findOne({
            _id: req.params.id,
            isDeleted: false,
            userId: ObjectId(req.user._id)
        })
        .select("-createdAt -updatedAt");
    if (!education) throw process.lang.INVALID_ID;

    await Model.education.findByIdAndUpdate(
        { _id: education._id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
    return {};
}

//***************************** Experience ***********************************//

async function addExperience(req) {
    req.body.userId = req.user._id;
    if (req.body.categoryId) {
        await Model.user.findByIdAndUpdate(
            { _id: req.user._id, isDeleted: false },
            { $set: { categoryId: req.body.categoryId } },
            { new: true }
        );
    }
    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    return await Model.experience.create(req.body);
}

async function getExperience(req) {
    let page = req.query.page;
    let size = req.query.size;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 10;
    skip = skip * limit;
    let qry = { isDeleted: false, userId: ObjectId(req.user._id) };

    let experience;
    if (req.params.id) {
        experience = await Model.experience
            .findOne({ _id: ObjectId(req.params.id), ...qry })
            .populate("categoryId")
            .select("-createdAt -updatedAt");
    } else {
        let pipeline = [];
        pipeline.push(
            { $match: { isDeleted: false, userId: ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryId"
                }
            },
            {
                $project: {
                    isDeleted: 0,
                    isBlocked: 0,
                    "categoryId.isBlocked": 0,
                    "categoryId.isDeleted": 0,
                    createdAt: 0,
                    updatedAt: 0,
                    "categoryId.createdAt": 0,
                    "categoryId.updatedAt": 0
                }
            }
        );
        pipeline = await common.pagination(pipeline, skip, limit);

        [experience] = await Model.experience.aggregate(pipeline);
    }
    return experience;
}

async function updateExperience(req) {
    let experience = await Model.experience
        .findOne({
            _id: req.params.id,
            isDeleted: false,
            userId: ObjectId(req.user._id)
        })
        .select("-createdAt -updatedAt");
    if (!experience) throw process.lang.INVALID_ID;

    if (req.body.categoryId) {
        await Model.user.findByIdAndUpdate(
            { _id: req.user._id, isDeleted: false },
            { $set: { categoryId: req.body.categoryId } },
            { new: true }
        );
    }
    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    experience = await Model.experience.findByIdAndUpdate(
        { _id: experience._id },
        req.body,
        { new: true }
    );
    return experience;
}

async function deleteExperience(req) {
    let experience = await Model.experience
        .findOne({
            _id: req.params.id,
            isDeleted: false,
            userId: ObjectId(req.user._id)
        })
        .select("-createdAt -updatedAt");
    if (!experience) throw process.lang.INVALID_ID;

    await Model.experience.findByIdAndUpdate(
        { _id: experience._id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
    return {};
}

//***************************** Address ***********************************//

async function addAddress(req) {
    req.body.userId = req.user._id;
    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: req.user._id }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    return await Model.address.create(req.body);
}

async function getAddress(req) {
    let page = req.query.page;
    let size = req.query.size;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 10;
    skip = skip * limit;
    let qry = { isDeleted: false, userId: ObjectId(req.user._id) };

    let address;
    if (req.params.id) {
        address = await Model.address
            .findOne({ _id: ObjectId(req.params.id), ...qry })
            .select("-createdAt -updatedAt");
    } else {
        let pipeline = [];
        pipeline.push({
            $match: { isDeleted: false, userId: ObjectId(req.user._id) }
        });
        pipeline = await common.pagination(pipeline, skip, limit);
        [address] = await Model.address.aggregate(pipeline);
    }
    return address;
}

async function updateAddress(req) {
    let address = await Model.address
        .findOne({
            _id: req.params.id,
            isDeleted: false,
            userId: ObjectId(req.user._id)
        })
        .select("-createdAt -updatedAt");
    if (!address) throw process.lang.INVALID_ID;

    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    address = await Model.address.findByIdAndUpdate(
        { _id: address._id },
        req.body,
        { new: true }
    );
    return address;
}

async function deleteAddress(req) {
    let address = await Model.address
        .findOne({
            _id: req.params.id,
            isDeleted: false,
            userId: ObjectId(req.user._id)
        })
        .select("-createdAt -updatedAt");
    if (!address) throw process.lang.INVALID_ID;

    await Model.address.findByIdAndUpdate(
        { _id: address._id, isDeleted: false },
        { isDeleted: true }
    );
    return {};
}

//***************************** Document ***********************************//

async function addDocument(req) {
    req.body.userId = req.user._id;
    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    if (req.body.isProfileComplete) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { isProfileComplete: req.body.isProfileComplete } });
    }
    return await Model.document.create(req.body);
}

async function getDocument(req) {
    let page = req.query.page;
    let size = req.query.size;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 10;
    skip = skip * limit;
    let qry = { isDeleted: false, userId: ObjectId(req.user._id) };

    let document;
    if (req.params.id) {
        document = await Model.document
            .findOne({ _id: ObjectId(req.params.id), ...qry })
            .select("-createdAt -updatedAt");
    } else {
        let pipeline = [];
        pipeline.push({
            $match: { isDeleted: false, userId: ObjectId(req.user._id) }
        });
        pipeline = await common.pagination(pipeline, skip, limit);
        [document] = await Model.document.aggregate(pipeline);
    }
    return document;
}

async function updateDocument(req) {
    let document = await Model.document
        .findOne({
            _id: req.params.id,
            isDeleted: false,
            userId: ObjectId(req.user._id)
        })
        .select("-createdAt -updatedAt");
    if (!document) throw process.lang.INVALID_ID;

    if (req.body.profileCompleteAt) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { profileCompleteAt: req.body.profileCompleteAt } });
    }
    if (req.body.isProfileComplete) {
        await Model.user.findOneAndUpdate({ _id: ObjectId(req.user._id) }, { $set: { isProfileComplete: req.body.isProfileComplete } });
    }
    document = await Model.document.findByIdAndUpdate(
        { _id: document._id },
        req.body,
        { new: true }
    );
    return document;
}

async function deleteDocument(req) {
    let document = await Model.document
        .findOne({
            _id: req.params.id,
            isDeleted: false,
            userId: ObjectId(req.user._id)
        })
        .select("-createdAt -updatedAt");
    if (!document) throw process.lang.INVALID_ID;

    await Model.document.findByIdAndUpdate(
        { _id: document._id, isDeleted: false },
        { isDeleted: true }
    );
    return {};
}
async function getCategory(req) {
    let pipeline = [];
    pipeline.push({ $match: { isDeleted: false } });

    if (req.query.type) {
        pipeline.push({ $match: { type: Number(req.query.type) } });
    }

    let category = await Model.category.aggregate(pipeline);
    return category;
}

//***************************** Slots ***********************************//

async function addSlots(req) {
    req.body.userId = req.user._id;
    req.body.isDeleted = false;
    return await Model.Slots.findOneAndUpdate(
        { day: req.body.day, userId: req.user._id },
        req.body,
        { new: true, upsert: true }
    ).select("-createdAt -updatedAt");
}

async function getSlots(req) {
    let page = req.query.page;
    let size = req.query.size;
    let skip = parseInt(page - 1) || 0;
    let limit = parseInt(size) || 10;
    skip = skip * limit;
    let qry = { isDeleted: false, userId: ObjectId(req.user._id) };

    let slots;
    if (req.params.id) {
        slots = await Model.Slots.findOne({
            _id: ObjectId(req.params.id),
            ...qry
        }).select("-createdAt -updatedAt");
    } else {
        let pipeline = [];
        pipeline.push({
            $match: { isDeleted: false, userId: ObjectId(req.user._id) }
        });
        pipeline = await common.pagination(pipeline, skip, limit);
        [slots] = await Model.Slots.aggregate(pipeline);
    }
    return slots;
}

async function updateSlots(req) {
    let slots = await Model.Slots.findOne({
        _id: req.params.id,
        isDeleted: false,
        userId: ObjectId(req.user._id)
    }).select("-createdAt -updatedAt");
    if (!slots) throw process.lang.INVALID_ID;

    slots = await Model.Slots.findByIdAndUpdate({ _id: slots._id }, req.body, {
        new: true
    });
    return slots;
}

async function deleteSlots(req) {
    let slots = await Model.Slots.findOne({
        _id: req.params.id,
        isDeleted: false,
        userId: ObjectId(req.user._id)
    }).select("-createdAt -updatedAt");
    if (!slots) throw process.lang.INVALID_ID;

    await Model.Slots.findByIdAndUpdate(
        { _id: slots._id, isDeleted: false },
        { isDeleted: true }
    );
    return {};
}

async function getBanner(req) {
    let pipeline = [];
    if (req.query.type) {
        pipeline.push({ $match: { isDeleted: false, type: req.query.type } });
    } else {
        pipeline.push({ $match: { isDeleted: false } });
    }
    let [category] = await Model.banner.aggregate(pipeline);
    return category;
}

module.exports = {
    getProfileDetail,
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

    userClearNotification,
    logout,
    createUser,
    setPassword,
    verifyOTP,
    socialLogin,
    _doLogin,
    updateprofile,
    getprofile,
    login,
    forgotpassword,
    changePassword,
    dashboard,
    userNotification,
    sendOtp
};
