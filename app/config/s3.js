const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const SECRET_ACCESS_KEY="z446eF/F2kGGPNeePeVtfgVUF7ADOf+YaAc6MCvv"
const ACCESS_KEY_ID="AKIA4767PRPRCUICZC23"
const REGION="ap-southeast-2"

aws.config.update({
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
  region: REGION
});

const s3 = new aws.S3();
const storage = multerS3({
  s3: s3,
  acl: 'public-read',
  bucket: 'gu-profile-pictures',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
      cb(null, Date.now().toString()); //use Date.now() for unique file keys
  }
});

module.exports = {
  aws,
  storage
};