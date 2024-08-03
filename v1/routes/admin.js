const router = require("express").Router();
const Controllers = require("../controllers").user;
const adminController = require("../controllers").admin;
const Service = require("../services");
const upload = require("../services/fileUpload");



//----------onBoarding-------------------------------
router.post("/signup", adminController.signup);
router.post("/login", adminController.login);
router.post("/forgotPassword", adminController.forgotPassword);
router.post("/verifyOtp", adminController.verifyOtp);
router.post("/setPassword", Service.authService.adminAuth, adminController.setPassword);
router.put("/updateProfile", Service.authService.adminAuth, adminController.updateProfile);
router.get("/profile", Service.authService.adminAuth, adminController.getProfile);
router.post("/changePassword", Service.authService.adminAuth, adminController.changePassword);
router.post("/upload", upload.fileUpload.single('image'), Controllers.fileUpload);


// SubAdmin
router.post("/subAdmin", Service.authService.adminAuth, adminController.addSubadmin);
router.get("/subAdmin", Service.authService.adminAuth, adminController.getSubadmin);
router.get("/subAdmin/:id", Service.authService.adminAuth, adminController.getSubadmin);
router.put("/subAdmin/:id", Service.authService.adminAuth, adminController.updateSubadmin);
router.delete("/subAdmin/:id", Service.authService.adminAuth, adminController.deleteSubadmin);

// cms 
router.post("/cms", Service.authService.adminAuth, adminController.addCms);
router.put("/cms/:id", Service.authService.adminAuth, adminController.updateCms);
router.get("/cms", Service.authService.adminAuth, adminController.getCms);

// setting
router.put("/setting", Service.authService.adminAuth, adminController.updateSetting);
router.get("/setting", Service.authService.adminAuth, adminController.getSetting);

// faq
router.post("/faq", Service.authService.adminAuth, adminController.addFaq);
router.put("/faq/:id", Service.authService.adminAuth, adminController.updateFaq);
router.delete("/faq/:id", Service.authService.adminAuth, adminController.deleteFaq);
router.get("/faq", Service.authService.adminAuth, adminController.getFaq);
router.get("/faq/:id", Service.authService.adminAuth, adminController.getFaq);


//dashboard
router.get("/dashboard", Service.authService.adminAuth, adminController.getDashboard);


// Category
router.post("/category", Service.authService.adminAuth, adminController.addCategory);
router.get("/category", Service.authService.adminAuth, adminController.getCategory);
router.get("/category/:id", Service.authService.adminAuth, adminController.getCategory);
router.put("/category/:id", Service.authService.adminAuth, adminController.updateCategory);
router.delete("/category/:id", Service.authService.adminAuth, adminController.deleteCategory);


// banner
router.post("/banner", Service.authService.adminAuth, adminController.addBanner);
router.get("/banner", Service.authService.adminAuth, adminController.getBanner);
router.get("/banner/:id", Service.authService.adminAuth, adminController.getBanner);
router.put("/banner/:id", Service.authService.adminAuth, adminController.updateBanner);
router.delete("/banner/:id", Service.authService.adminAuth, adminController.deleteBanner);


module.exports = router;
