const multer = require("multer");

const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/superadmin/promotion.controller");
const { storage } = require("../config/s3");
const upload = multer({ storage }).single("image");
const multipleUpload = multer({ storage }).array("images");

module.exports = function (app) {
  app.post(
    "/vendors",
    multipleUpload,
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createVendor
  );
  app.post(
    "/promotions",
    upload,
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createPromotion
  );
  
  app.use(errors());
};
