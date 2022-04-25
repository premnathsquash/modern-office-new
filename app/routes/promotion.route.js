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
  app.get(
    "/vendors",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.listVendor
  );

  app.patch(
    "/vendors",
    multipleUpload,
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateVendor
  );

  app.delete(
    "/vendors",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteVendor
  );

  app.post(
    "/promotions",
    upload,
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createPromotion
  );
  app.get(
    "/promotions",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.listPromotion
  );

  app.patch(
    "/promotions",
    upload,
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updatePromotion
  );

  app.delete(
    "/promotions",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deletePromotion
  );
  
  app.use(errors());
};
