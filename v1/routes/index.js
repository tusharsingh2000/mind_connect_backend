const express = require("express");
const user = require("./user");
const adminRoute = require("./admin");
const router = express();
router.use("/user", user);
router.use("/admin", adminRoute);

//console.log(expressListRoutes(router));
module.exports = router;
