const multer = require("multer");
const { errors } = require("celebrate");
const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const { storage } = require("../config/s3");
const upload = multer({ storage }).single("image");
const multipleUpload = multer({ storage }).array('images');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );

  app.post("/auth/admin-login", controller.signin);

  app.post("/auth/user-signup", 
  upload,
  [
    verifySignUp.checkDuplicateProfilenameOrEmail,
    verifySignUp.checkRolesExisted,
    authJwt.verifyToken, 
    authJwt.isClient
  ],
  controller.userSignup) 

  app.post("/auth/user-login", controller.userLoginIn)

  app.post("/auth/send-password", controller.resetPassReq);

  app.post("/auth/reset-password", controller.resetPassword);

  app.post(
    "/reset-password",
    [authJwt.verifyToken, authJwt.isClient],
    controller.resetPasswordInternal
  );

  app.patch(
    "/update-profile",
    multipleUpload,
    [authJwt.verifyToken, authJwt.isClient],
    controller.updateProfile
  );

  app.get("/logout", controller.logout)

  app.use(errors());
};
