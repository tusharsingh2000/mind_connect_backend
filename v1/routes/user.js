const router = require("express").Router();
const Controllers = require("../controllers").user;
const adminController = require("../controllers").admin;

const Service = require("../services");
const upload = require("../services/fileUpload");

//OnBoarding
router.post("/register", Controllers.signup);
router.post("/verifyotp", Controllers.verifyOtp);
router.post("/sendotp", Controllers.sendOtp);
router.post(
  "/profile",
  Service.authService.userAuth,
  Controllers.updateprofile
);
router.get("/profile", Service.authService.userAuth, Controllers.getprofile);
router.post(
  "/changepassword",
  Service.authService.userAuth,
  Controllers.changePassword
);
router.post("/login", Controllers.loginApp);
router.post("/forgotpassword", Controllers.forgotpassword);
router.post("/logout", Service.authService.userAuth, Controllers.logout);

router.post(
  "/setPassword",
  Service.authService.userAuth,
  Controllers.setPassword
);
router.post("/socialLogin", Controllers.socialLogin);
router.post(
  "/upload",
  upload.fileUpload.single("image"),
  Controllers.fileUpload
);

// Education
router.post(
  "/education",
  Service.authService.userAuth,
  Controllers.addEducation
);
router.get(
  "/education",
  Service.authService.userAuth,
  Controllers.getEducation
);
router.get(
  "/education/:id",
  Service.authService.userAuth,
  Controllers.getEducation
);
router.put(
  "/education/:id",
  Service.authService.userAuth,
  Controllers.updateEducation
);
router.delete(
  "/education/:id",
  Service.authService.userAuth,
  Controllers.deleteEducation
);

// experience
router.post(
  "/experience",
  Service.authService.userAuth,
  Controllers.addExperience
);
router.get(
  "/experience",
  Service.authService.userAuth,
  Controllers.getExperience
);
router.get(
  "/experience/:id",
  Service.authService.userAuth,
  Controllers.getExperience
);
router.put(
  "/experience/:id",
  Service.authService.userAuth,
  Controllers.updateExperience
);
router.delete(
  "/experience/:id",
  Service.authService.userAuth,
  Controllers.deleteExperience
);

// address
router.post("/address", Service.authService.userAuth, Controllers.addAddress);
router.get("/address", Service.authService.userAuth, Controllers.getAddress);
router.get(
  "/address/:id",
  Service.authService.userAuth,
  Controllers.getAddress
);
router.put(
  "/address/:id",
  Service.authService.userAuth,
  Controllers.updateAddress
);
router.delete(
  "/address/:id",
  Service.authService.userAuth,
  Controllers.deleteAddress
);

// Document
router.post("/document", Service.authService.userAuth, Controllers.addDocument);
router.get("/document", Service.authService.userAuth, Controllers.getDocument);
router.get(
  "/document/:id",
  Service.authService.userAuth,
  Controllers.getDocument
);
router.put(
  "/document/:id",
  Service.authService.userAuth,
  Controllers.updateDocument
);
router.delete(
  "/document/:id",
  Service.authService.userAuth,
  Controllers.deleteDocument
);

// slots
router.post("/slots", Service.authService.userAuth, Controllers.addSlots);
router.get("/slots", Service.authService.userAuth, Controllers.getSlots);
router.get("/slots/:id", Service.authService.userAuth, Controllers.getSlots);
router.put("/slots/:id", Service.authService.userAuth, Controllers.updateSlots);
router.delete(
  "/slots/:id",
  Service.authService.userAuth,
  Controllers.deleteSlots
);

// Dsahboard
router.get("/dashboard", Service.authService.userAuth, Controllers.dashboard);

router.get("/sp/:id", Service.authService.userAuth, Controllers.serviceProviderDetail);

// category
router.get("/category", Service.authService.userAuth, Controllers.getCategory);

// banner
router.get("/banner", Service.authService.userAuth, Controllers.getBanner);

// Notifcation
router.get(
  "/notification",
  Service.authService.userAuth,
  Controllers.userNotification
);
router.put(
  "/clearNotification",
  Service.authService.userAuth,
  Controllers.notificationClear
);

router.get("/cms", adminController.getCms);

module.exports = router;
