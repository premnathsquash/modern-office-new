const multer = require("multer");
const uploadcsv = multer({ dest: "../files" });
const { errors } = require("celebrate");
const {  authJwt } = require("../middlewares");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
/* 
  app.patch(
    "/mobile-user-profile-image",
    uploadcsv,
    [ authJwt.verifyToken, authJwt.isUser],
    controller31.updateProfileImage
  );
 */
  app.use(errors());
};