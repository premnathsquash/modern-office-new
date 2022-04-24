
const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/admin/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/edit-profile-attendance",
    [authJwt.verifyToken, authJwt.isClient],
    controller.editProfileAttendance
  );

  app.use(errors());
}