require("dotenv").config()

const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const REGION = process.env.REGION;

aws.config.update({
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
  region: REGION,
});

const s3 = new aws.S3();
const storage = multerS3({
  s3: s3,
  acl: "public-read",
  bucket: "gu-profile-pictures",
  endpoint: "http://" + this.bucket + ".s3.amazonaws.com",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    cb(null, "" + file.originalname +Date.now().toString()); //use Date.now() for unique file keys
  },
});

module.exports = {
  aws,
  storage,
};
