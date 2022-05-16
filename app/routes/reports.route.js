const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/admin/report.controller");
const controller1 = require("../controllers/superadmin/report.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/reports/client/peak-days",
    [authJwt.verifyToken, authJwt.isClient],
    controller.peakDays
  );

  app.get(
    "/reports/client/total-occ",
    [authJwt.verifyToken, authJwt.isClient],
    controller.totalOcc
  );
  app.get(
    "/reports/client/peak-times-quite-times",
    [authJwt.verifyToken, authJwt.isClient],
    controller.peakTimesQuiteTimes
  );
  app.get(
    "/reports/client/con-single-desk",
    [authJwt.verifyToken, authJwt.isClient],
    controller.conSingleDesk
  );
  app.get(
    "/reports/client/time-utilization",
    [authJwt.verifyToken, authJwt.isClient],
    controller.timeUtilization
  );
  app.get(
    "/reports/client/top-bootom-desk",
    [authJwt.verifyToken, authJwt.isClient],
    controller.topBootomDesk
  );
  app.get(
    "/reports/client/shows",
    [authJwt.verifyToken, authJwt.isClient],
    controller.shows
  );
  app.get(
    "/reports/client/user-detail-nfo",
    [authJwt.verifyToken, authJwt.isClient],
    controller.userDetailInfo
  );

  app.get(
    "/reports/admin/peak-days/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.peakDays
  );
  app.get(
    "/reports/admin/total-occ/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.totalOcc
  );
  app.get(
    "/reports/admin/total-occ/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.totalOcc
  );
  app.get(
    "/reports/admin/total-occ/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.totalOcc
  );
  app.get(
    "/reports/admin/total-occ/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.totalOcc
  );

  app.use(errors());
};
