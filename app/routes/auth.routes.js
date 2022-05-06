const multer = require("multer");
const { errors } = require("celebrate");
const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/admin/auth.controller");
const controller1 = require("../controllers/superadmin/admin.controller");
const controller2 = require("../controllers/superadmin/company.controller");
const controller21 = require("../controllers/superadmin/user.controller");
const controller3 = require("../controllers/mobile/auth.controller");
const { storage } = require("../config/s3");
const upload = multer({ storage }).single("image");
const multipleUpload = multer({ storage }).array("images");

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

  app.post(
    "/auth/user-signup",
    upload,
    [
      verifySignUp.checkDuplicateProfilenameOrEmail,
      verifySignUp.checkRolesExisted,
      authJwt.verifyToken,
      authJwt.isClient,
    ],
    controller.userSignup
  );

  app.post("/auth/user-login", controller.userLoginIn);

  app.post("/auth/send-password", controller.resetPassReq);

  app.post("/auth/reset-password", controller.resetPassword);

  app.post(
    "/reset-password",
    [authJwt.verifyToken, authJwt.isClient],
    controller.resetPasswordInternal
  );

  app.post(
    "/reset-password-admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.resetPasswordInternal
  );

  app.post(
    "/admin-user",
    upload,
    [ verifySignUp.checkDuplicateUsernameOrEmail, authJwt.verifyToken, authJwt.isAdmin],
    controller21.createAdminUser
  );

  app.get(
    "/admin-users",
    [ authJwt.verifyToken, authJwt.isAdmin],
    controller21.listAdmins
  );
  app.patch(
    "/admin-user/:id",
    upload,
    [ authJwt.verifyToken, authJwt.isAdmin],
    controller21.updateAdminUser
  );

  app.delete(
    "/admin-user/:id",
    [ authJwt.verifyToken, authJwt.isAdmin],
    controller21.deleteeAdminUser
  );

  app.patch(
    "/update-profile",
    multipleUpload,
    [authJwt.verifyToken, authJwt.isClient],
    controller.updateProfile
  );

  app.get("/email-availability", controller.searchEmail);

  app.get(
    "/users",
    [authJwt.verifyToken, authJwt.isClient],
    controller.getAllProfileusers
  );

  app.patch(
    "/users-profile",
    upload,
    [authJwt.verifyToken, authJwt.isClient],
    controller.userUpdateProfile
  )
  app.delete(
    "/users-profile",
    [authJwt.verifyToken, authJwt.isClient],
    controller.userDeleteProfile
  )

  app.get(
    "/get-profile",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.getAdminProfile
  );

  app.get(
    "/get-profile-client",
    [authJwt.verifyToken, authJwt.isClient],
    controller.getProfileCompany
  );

  app.get(
    "/list-companies",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller2.getAllCompanies
  );

  app.post(
    "/reset-password-mobile",
    controller3.resetPassReq
  );

  app.post(
    "/send-mobile-email",
    controller3.checkOtp
  );

  app.get("/logout", controller.logout);

  app.use(errors());
};
