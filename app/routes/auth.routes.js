const multer = require("multer");
const { errors } = require("celebrate");
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const { storage } = require("../config/s3");
const upload = multer({ storage });

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
    upload.single("image"),
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );

  app.post("/auth/admin-login", controller.signin);

  app.post("/auth/send-password", controller.resetPassReq);

  app.post("/auth/reset-password", controller.resetPassword);

  app.use(errors());
};
