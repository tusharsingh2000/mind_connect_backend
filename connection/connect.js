const mongoose = require("mongoose");
const config = require('config');
const Model = require('../models');


var mongoDbconnection = async function () {
    var url = process.env.MONGODB_URL; // config.get("mongo.url");
    console.log(url);
    if (process.env.NODE_ENV == 'docker') {
        await mongoose.connect(url, {
            auth: {
                authSource: config.get("mongo.authSource")
            },
            user: config.get("mongo.user"),
            pass: config.get("mongo.pass"),
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false
        });
    } else {
        await mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
    }
    let cms = await Model.cms.findOne({ isDeleted: false });
    if (!cms) {
        await Model.cms.create({ isDeleted: false });
    }

    let setting = await Model.setting.findOne({ isDeleted: false });
    if (!setting) {
        await Model.setting.create({ isDeleted: false });
    }
};

module.exports = {
    mongoDbconnection: mongoDbconnection
};