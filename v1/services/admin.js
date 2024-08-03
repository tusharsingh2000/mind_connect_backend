const Model = require("../../models");
const utility = require("../../utility/Utility");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Otp = require("./otp");
const common = require("./common");
const moment = require("moment");
const responseCode = require("../../utility/responseCode");
// const emailService = require('./emailService')
// const pushNotification = require('../../utility/pushNotifications');

//*************************** OnBoarding****************************//

async function createAdmin(data) {
  let qry = {
    isDeleted: false
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

  qry.$or = or;
  if (or.length > 0) {
    let admin = await Model.admin.findOne(qry, {
      email: 1,
      phone: 1
    });

    if (admin) {
      if (admin.email == data.email.toLowerCase()) {
        throw process.lang.DUPLICATE_EMAIL;
      }
      if (admin.phone == data.phone) {
        throw process.lang.DUPLICATE_PHONE;
      }
    }
  }

  data.password = await utility.hashPasswordUsingBcrypt(data.password);

  let admin = await Model.admin.create(data);

  if (!admin) {
    throw responseCode.BAD_REQUEST;
  }
  return {
    email: admin.email,
    phone: admin.phone,
    _id: admin._id
  };
}
const login = async (data) => {
  let setObj = {
    deviceType: data.deviceType,
    deviceToken: data.deviceToken,
  };
  let planPassword = data.password;
  delete data.deviceType;
  delete data.deviceToken;
  delete data.password;
  let qry = {};

  if (utility.isEmail(data.key)) {
    qry.email = data.key;
  } else {
    qry.phone = data.key;
  }
  let admin = await Model.admin.findOne(qry);

  if (!admin) {
    throw process.lang.INVALID_CREDENTIALS;
  }
  let match = await utility.comparePasswordUsingBcrypt(
    planPassword,
    admin.password
  );
  if (!match) {
    throw process.lang.INVALID_CREDENTIALS;
  }
  admin = await Model.admin
    .findOneAndUpdate({ _id: mongoose.Types.ObjectId(admin._id) }, setObj)
    .lean();
  admin = await Model.admin
    .findOne({ _id: mongoose.Types.ObjectId(admin._id) })
    .populate("subAdminId")
    .lean();
  admin.token = await utility.jwtSign({ _id: admin._id, role: "ADMIN" });
  admin.type = "Bearer";
  admin.expire = await utility.getJwtExpireTime();
  admin.refreshToken = await utility.jwtRefreshSign({ _id: admin._id });

  return admin;
};
async function resetPassword(data) {
  if ((data.key && utility.isEmail(data.key)) || data.email) {
    let email = data.key || data.email;
    let user = await Model.admin.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw process.lang.INVALID_EMAIL;
    }
    let otp = await Otp.generateEmailVerification(
      user.email,
      null,
      user ? user.firstName : ""
    );
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
async function verifyOtp(data) {
  if (data.key && utility.isEmail(data.key)) {
    data.email = data.key;
    return await verifyEmail(data, null, true);
  } else {
    throw process.lang.INVALID_CREDENTIALS;
  }
}
async function verifyEmail(data, user, removeOtp = true) {
  let otp = await Otp.verifyEmailCode(data.email, data.code, removeOtp, null);
  if (!otp) {
    throw process.lang.OTP_INVALID;
  }
  let admin = await Model.admin
    .findOne({ email: data.email.toLowerCase() })
    .lean();

  admin.token = await utility.jwtSign({ _id: admin._id, role: "ADMIN" });
  admin.type = "Bearer";
  admin.expire = await utility.getJwtExpireTime();
  admin.refreshToken = await utility.jwtRefreshSign({ _id: admin._id });
  return admin;
}
async function changePassword(data, admin) {
  if (!admin.forResetPassword) {
    let findadmin = await Model.admin.findOne(
      { _id: admin._id },
      {
        password: 1,
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
  await Model.admin.findByIdAndUpdate(admin._id, {
    $set: {
      password: await utility.hashPasswordUsingBcrypt(data.password),
    },
  });
  return true;
}
async function updateProfile(req) {
  let data = req.body;
  let qry = {
    _id: {
      $ne: req.admin._id,
    },
    isDeleted: false,
  };

  let or = [];
  if (data.email) {
    or.push({
      email: data.email.toLowerCase(),
    });
  }
  if (data.phone) {
    or.push({
      phone: data.phone,
    });
  }

  qry.$or = or;
  if (or.length > 0) {
    let duplicateUser = await Model.admin.findOne(qry, {
      email: 1,
      phone: 1,
    });

    if (duplicateUser) {
      if (duplicateUser.email == data.email.toLowerCase()) {
        throw process.lang.DUPLICATE_EMAIL;
      }
      if (duplicateUser.phone == data.phone) {
        throw process.lang.DUPLICATE_PHONE;
      }
    }
  }
  data.isProfileComplete = true;
  let updatedUser = await Model.admin
    .findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.admin._id) }, data, {
      new: true,
    })
    .lean();
  return updatedUser;
}
async function getProfile(data) {
  return await Model.admin.findById(mongoose.Types.ObjectId(data._id)).lean();
}

//***************************** SUBADMIN ***********************************//

async function addSubAdmin(data) {
  let subadmin = await Model.admin.findOne({
    email: data.body.email,
    isDeleted: false,
  });
  if (subadmin) throw process.lang.DUPLICATE_EMAIL;

  data.body.role = "SUBADMIN";
  if (data.body.password) {
    data.body.password = await utility.hashPasswordUsingBcrypt(
      data.body.password
    );
  }
  let subAdmin = await Model.subAdmin.create(data.body);
  data.body.subAdminId = subAdmin._id;
  subAdmin = await Model.admin.create(data.body);
  return subadmin;
}
async function getSubAdmin(data) {
  let page = data.query.page;
  let size = data.query.size;
  let skip = parseInt(page - 1) || 0;
  let limit = parseInt(size) || 10;
  skip = skip * limit;
  let qry = { isDeleted: false, role: "SUBADMIN" };

  if (data.query.status) qry.isBlocked = data.query.status;
  if (data.query.search) {
    qry.$or = [
      { name: { $regex: data.query.search, $options: "i" } },
      { email: { $regex: data.query.search, $options: "i" } },
      { phone: { $regex: data.query.search, $options: "i" } },
    ];
  }
  let subAdmin;
  if (data.params.id) {
    subAdmin = await Model.admin
      .findOne({ _id: ObjectId(data.params.id), ...qry })
      .populate("subAdminId");
  } else {
    subAdmin = await Model.admin
      .find({ ...qry })
      .populate("subAdminId")
      .skip(skip)
      .limit(limit);
  }
  return subAdmin;
}
async function updateSubAdmin(data) {
  let admin = await Model.admin.findOne({
    _id: data.params.id,
    isDeleted: false,
  });
  if (!admin) throw process.lang.SUBADMIN_NOT_FOUND;

  let subAdmin = await Model.subAdmin.findOne({
    _id: admin.subAdminId,
    isDeleted: false,
  });
  if (!subAdmin) throw process.lang.SUBADMIN_NOT_FOUND;

  if (data.password) {
    data.password = await utility.hashPasswordUsingBcrypt(data.body.password);
  }
  await Model.subAdmin.findByIdAndUpdate({ _id: admin.subAdminId }, data.body, {
    new: true,
  });
  await Model.admin.findByIdAndUpdate({ _id: data.params.id }, data.body, {
    new: true,
  });
  subAdmin = await Model.admin
    .findOne({ _id: ObjectId(data.params.id), isDeleted: false })
    .populate("subAdminId");
  return subAdmin;
}
async function deleteSubAdmin(data) {
  let admin = await Model.admin.findOne({
    _id: data.params.id,
    isDeleted: false,
  });
  if (!admin) throw process.lang.SUBADMIN_NOT_FOUND;

  let subAdmin = await Model.subAdmin.findOne({
    _id: admin.subAdminId,
    isDeleted: false,
  });
  if (!subAdmin) throw process.lang.SUBADMIN_NOT_FOUND;
  await Model.admin.findByIdAndUpdate(
    { _id: data.params.id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  await Model.subAdmin.findByIdAndUpdate(
    { _id: admin.subAdminId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  return {};
}

//************************************** CMS **********************************//

async function addCms(data) {
  return await Model.cms.create(data.body);
}
async function updateCms(data) {
 let cms = await Model.cms.findOneAndUpdate({  isDeleted: false }, data.body, {
    new: true
  });
  return cms;
}
async function getCms() {
  return await Model.cms.findOne({ isDeleted: false });
}

async function updateSetting(data) {
  let   setting = await Model.setting.findOneAndUpdate({ isDeleted : false }, data.body, {
      new: true
    });
    return setting;
  }
  async function getSetting() {
    return await Model.setting.findOne({ isDeleted: false });
  }
//************************************** DashBoard ************************************//

async function getDashboard(data) {
  const StartofWeek = new Date(moment().utcOffset(0).startOf("week"));
  const EndofWeek = new Date(moment().utcOffset(0).endOf("week"));
  const startOFMonth = new Date(moment().utcOffset(0).startOf("month"));
  const endOFMonth = new Date(moment().utcOffset(0).endOf("month"));
  const startOFYear = new Date(moment().utcOffset(0).startOf("year"));
  const endOFYear = new Date(moment().utcOffset(0).endOf("year"));

  let detail = {};
  detail.userCount = await Model.user.countDocuments({ isDeleted: false });
  detail.postCount = await Model.post.countDocuments({ isDeleted: false });
  if (data.query.personType == "daily") {
    var su = 0,
      mo = 0,
      tu = 0,
      we = 0,
      th = 0,
      fr = 0,
      sa = 0,
      users = await Model.user.aggregate([
        {
          $match: {
            createdAt: { $gte: StartofWeek, $lte: EndofWeek },
            isDeleted: false,
          },
        },
      ]);
    users.map((val) => {
      let hour = moment(val.createdAt).format("dd");
      // eslint-disable-next-line default-case
      switch (hour) {
        case "Mo":
          mo = mo + 1;
          break;
        case "tu":
          tu = tu + 1;
          break;
        case "we":
          we = we + 1;
          break;
        case "Th":
          th = th + 1;
          break;
        case "fr":
          fr = fr + 1;
          break;
        case "Sa":
          sa = sa + 1;
          break;
        case "su":
          su = su + 1;
          break;
      }
    });
    detail.persondata = {
      sun: su,
      mon: mo,
      tue: tu,
      wed: we,
      thr: th,
      fri: fr,
      sat: sa,
    };
  } else if (data.query.personType == "weekly") {
    var w1 = 0,
      w2 = 0,
      w3 = 0,
      w4 = 0;
    users = await Model.user.aggregate([
      {
        $match: {
          createdAt: { $gte: startOFMonth, $lte: endOFMonth },
          isDeleted: false,
        },
      },
    ]);
    users.map((val) => {
      // console.log(val);
      let week = Math.ceil(Number(moment(val.createdAt).format("D") / 7));

      // eslint-disable-next-line default-case
      switch (week) {
        case 1:
          w1 = w1 + 1;
          break;
        case 2:
          w2 = w2 + 1;
          break;
        case 3:
          w3 = w3 + 1;
          break;
        case 4:
          w4 = w4 + 1;
          break;
      }
    });

    detail.persondata = { week1: w1, week2: w2, week3: w3, week4: w4 };
  } else if (data.query.personType == "monthly") {
    var jan = 0,
      feb = 0,
      mar = 0,
      apr = 0,
      may = 0,
      jun = 0,
      jul = 0,
      aug = 0,
      sep = 0,
      oct = 0,
      nov = 0,
      dec = 0;
    users = await Model.user.aggregate([
      {
        $match: {
          createdAt: { $gte: startOFYear, $lte: endOFYear },
          isDeleted: false,
        },
      },
    ]);
    users.map((val) => {
      let year = Math.ceil(Number(moment(val.createdAt).format("M")));
      // eslint-disable-next-line default-case
      switch (year) {
        case 0:
          jan = jan + 1;
          break;
        case 1:
          feb = feb + 1;
          break;
        case 2:
          mar = mar + 1;
          break;
        case 3:
          apr = apr + 1;
          break;
        case 4:
          may = may + 1;
          break;
        case 5:
          jun = jun + 1;
          break;
        case 6:
          jul = jul + 1;
          break;
        case 7:
          aug = aug + 1;
          break;
        case 8:
          sep = sep + 1;
          break;
        case 9:
          oct = oct + 1;
          break;
        case 10:
          nov = nov + 1;
          break;
        case 11:
          dec = dec + 1;
          break;
      }
    });
    detail.persondata = {
      jan: jan,
      feb: feb,
      mar: mar,
      apr: apr,
      may: may,
      jun: jun,
      jul: jul,
      aug: aug,
      sep: sep,
      oct: oct,
      nov: nov,
      dec: dec,
    };
  } else if (data.query.personType == "yearly") {
    users = await Model.user.aggregate([
      { $match: { isDeleted: false } },
      { $addFields: { year: { $year: "$createdAt" } } },
      { $group: { _id: "$year", total: { $sum: 1 } } },
    ]);
    var map = new Map();
    users.map((row) => {
      map.set(row._id, row.total);
    });

    const obj = await common.convertMap(map);
    detail.persondata = obj;
  }

  if (data.query.newPersonType == "daily") {
    var su = 0,
      mo = 0,
      tu = 0,
      we = 0,
      th = 0,
      fr = 0,
      sa = 0,
      users = await Model.user.aggregate([
        {
          $match: {
            createdAt: { $gte: StartofWeek, $lte: EndofWeek },
            isDeleted: false,
          },
        },
      ]);
    users.map((val) => {
      let hour = moment(val.createdAt).format("dd");
      // eslint-disable-next-line default-case
      switch (hour) {
        case "Mo":
          mo = mo + 1;
          break;
        case "tu":
          tu = tu + 1;
          break;
        case "we":
          we = we + 1;
          break;
        case "Th":
          th = th + 1;
          break;
        case "fr":
          fr = fr + 1;
          break;
        case "Sa":
          sa = sa + 1;
          break;
        case "su":
          su = su + 1;
          break;
      }
    });
    detail.newPersondata = {
      sun: su,
      mon: mo,
      tue: tu,
      wed: we,
      thr: th,
      fri: fr,
      sat: sa,
    };
  } else if (data.query.newPersonType == "weekly") {
    var w1 = 0,
      w2 = 0,
      w3 = 0,
      w4 = 0;
    users = await Model.user.aggregate([
      {
        $match: {
          createdAt: { $gte: startOFMonth, $lte: endOFMonth },
          isDeleted: false,
        },
      },
    ]);
    users.map((val) => {
      // console.log(val);
      let week = Math.ceil(Number(moment(val.createdAt).format("D") / 7));

      // eslint-disable-next-line default-case
      switch (week) {
        case 1:
          w1 = w1 + 1;
          break;
        case 2:
          w2 = w2 + 1;
          break;
        case 3:
          w3 = w3 + 1;
          break;
        case 4:
          w4 = w4 + 1;
          break;
      }
    });

    detail.newPersondata = { week1: w1, week2: w2, week3: w3, week4: w4 };
  } else if (data.query.newPersonType == "monthly") {
    var jan = 0,
      feb = 0,
      mar = 0,
      apr = 0,
      may = 0,
      jun = 0,
      jul = 0,
      aug = 0,
      sep = 0,
      oct = 0,
      nov = 0,
      dec = 0;
    users = await Model.user.aggregate([
      {
        $match: {
          createdAt: { $gte: startOFYear, $lte: endOFYear },
          isDeleted: false,
        },
      },
    ]);
    users.map((val) => {
      let year = Math.ceil(Number(moment(val.createdAt).format("M")));
      // eslint-disable-next-line default-case
      switch (year) {
        case 0:
          jan = jan + 1;
          break;
        case 1:
          feb = feb + 1;
          break;
        case 2:
          mar = mar + 1;
          break;
        case 3:
          apr = apr + 1;
          break;
        case 4:
          may = may + 1;
          break;
        case 5:
          jun = jun + 1;
          break;
        case 6:
          jul = jul + 1;
          break;
        case 7:
          aug = aug + 1;
          break;
        case 8:
          sep = sep + 1;
          break;
        case 9:
          oct = oct + 1;
          break;
        case 10:
          nov = nov + 1;
          break;
        case 11:
          dec = dec + 1;
          break;
      }
    });
    detail.newPersondata = {
      jan: jan,
      feb: feb,
      mar: mar,
      apr: apr,
      may: may,
      jun: jun,
      jul: jul,
      aug: aug,
      sep: sep,
      oct: oct,
      nov: nov,
      dec: dec,
    };
  } else if (data.query.newPersonType == "yearly") {
    users = await Model.user.aggregate([
      { $match: { isDeleted: false } },
      { $addFields: { year: { $year: "$createdAt" } } },
      { $group: { _id: "$year", total: { $sum: 1 } } },
    ]);
    var map = new Map();
    users.map((row) => {
      map.set(row._id, row.total);
    });
    const obj = await common.convertMap(map);
    detail.newPersondata = obj;
  }
  return detail;
}

//************************************** FAQ *************************************//

async function addFaq(req) {
  return await Model.faq.create(req.body);
}
async function getFaq(data) {
  let qry = { isDeleted: false };
  if (data.org) {
    qry = { isDeleted: false, organization: ObjectId(data.org._id) };
  }
  let page = data.query.page;
  let size = data.query.size;
  let skip = parseInt(page - 1) || 0;
  let limit = parseInt(size) || 10;
  skip = skip * limit;
  if (data.query.search) {
    qry.$or = [
      { question: { $regex: data.query.search, $options: "i" } },
      { answer: { $regex: data.query.search, $options: "i" } },
    ];
  }
  let faq;
  if (data.params.id) {
    faq = await Model.faq.findOne({ _id: data.params.id, ...qry });
    if (!faq) {
      throw process.lang.INVALID_FAQ;
    }
    return faq;
  }
  faq = await Model.faq
    .find({ ...qry })
    .skip(skip)
    .limit(limit);
  let count = await Model.faq.find({ ...qry }).count();
  return { count: count, data: faq };
}
async function updateFaq(data) {
  let faq = await Model.faq.findOne({ _id: data.params.id, isDeleted: false });
  if (!faq) throw process.lang.INVALID_FAQ;

  return await Model.faq.findOneAndUpdate(
    { _id: data.params.id, isDeleted: false },
    data.body,
    { new: true }
  );
}
async function deleteFaq(data) {
  let faq = await Model.faq.findOne({ _id: data.params.id, isDeleted: false });
  if (!faq) throw process.lang.INVALID_FAQ;

  return await Model.faq.findOneAndUpdate(
    { _id: data.params.id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
}

//***************************** Category ***********************************//

async function addCategory(req) {
  return await Model.category.create(req.body);
}

async function getCategory(req) {
  let page = req.query.page;
  let size = req.query.size;
  let type = req.query.type;
  let skip = parseInt(page - 1) || 0;
  let limit = parseInt(size) || 10;
  skip = skip * limit;
  let qry = { isDeleted: false };

  if (type) {
    qry = {
      ...qry,
      type: Number(type),
    };
  }

  let category;
  if (req.params.id) {
    category = await Model.category.findOne({
      _id: ObjectId(req.params.id),
      ...qry,
    });
  } else {
    let pipeline = [];
    pipeline.push({ $match: qry });
    pipeline = await common.pagination(pipeline, skip, limit);
    [category] = await Model.category.aggregate(pipeline);
  }
  return category;
}

async function updateCategory(req) {
  let category = await Model.category.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!category) throw process.lang.INVALID_ID;

  return await Model.category.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  );
}

async function deleteCategory(req) {
  let category = await Model.category.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!category) throw process.lang.INVALID_ID;

  await Model.category.findByIdAndUpdate(
    { _id: category._id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  return {};
}

//***************************** banner ***********************************//

async function addBanner(req) {
  return await Model.banner.create(req.body);
}

async function getBanner(req) {
  let page = req.query.page;
  let size = req.query.size;

  let skip = parseInt(page - 1) || 0;
  let limit = parseInt(size) || 10;
  skip = skip * limit;
  let qry = { isDeleted: false };

  let banner;
  if (req.params.id) {
    banner = await Model.banner.findOne({
      _id: ObjectId(req.params.id),
      ...qry,
    });
  } else {
    let pipeline = [];
    pipeline.push({ $match: { isDeleted: false } });
    if (req.query.type) {
      pipeline.push({ $match: { type: Number(req.query.type) } });
    }
    pipeline = await common.pagination(pipeline, skip, limit);
    [banner] = await Model.banner.aggregate(pipeline);
  }
  return banner;
}

async function updateBanner(req) {
  let banner = await Model.banner.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!banner) throw process.lang.INVALID_ID;

  return await Model.banner.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  );
}

async function deleteBanner(req) {
  let banner = await Model.banner.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!banner) throw process.lang.INVALID_ID;

  await Model.banner.findByIdAndUpdate(
    { _id: banner._id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  return {};
}

module.exports = {
  addBanner,
  getBanner,
  updateBanner,
  deleteBanner,

  addCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  addFaq,
  getFaq,
  updateFaq,
  deleteFaq,
  createAdmin,
  login,
  resetPassword,
  verifyOtp,
  changePassword,
  updateProfile,
  getProfile,
  addSubAdmin,
  getSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  addCms,
  updateCms,
  getCms,
  getDashboard,
  updateSetting,
  getSetting
};
