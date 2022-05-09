const { errors } = require("celebrate");
const {  authJwt } = require("../middlewares");
const controller = require("../controllers/admin/dashboard.controller");
const controller1 = require("../controllers/superadmin/dashboard.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/dashboard/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.dashboard
  );

  app.get(
    "/dashboard/client/seatinfo",
    [authJwt.verifyToken, authJwt.isClient],
    controller.seatinfo
  );

  app.get(
    "/dashboard/client/attendance",
    [authJwt.verifyToken, authJwt.isClient],
    controller.workFromHomeOrOffice
  );

  app.get(
    "/dashboard/client/bookingreq/:date",
    [authJwt.verifyToken, authJwt.isClient],
    controller.bookingReq
  );

  app.get(
    "/dashboard/client/booking/:date",
    [authJwt.verifyToken, authJwt.isClient],
    controller.bookingInfo
  );

  app.use(errors());
};