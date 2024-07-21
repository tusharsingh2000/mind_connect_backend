
const multer = require('multer');
const path = require('path');
// const fs = require('fs');
var aws = require('aws-sdk');
const multerS3 = require('multer-s3');
// const config = require('config');

aws.config.update({
  secretAccessKey: process.env.BUCKET_KEY,
  accessKeyId: process.env.BUCKET_ID,
  region: process.env.BUCKET_REGION
  
});
var s3 = new aws.S3();


const bucketStorage = multerS3({
  s3: s3,
  acl: "public-read",
  // bucket: config.get("bucket.name"),
  bucket: process.env.BUCKET_NAME,
  key: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});





const profilePicStorage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../public/images'),

  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`);
  }
});

const ProfilePicUpload = multer({
  storage: profilePicStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "video/mp4") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Invalid File Format: Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// const singleUpload = multer({ storage: profilePicStorage });
const singleUpload = multer({ storage: bucketStorage });

module.exports = {
  fileUpload: singleUpload,
  ProfilePicUpload: ProfilePicUpload
};