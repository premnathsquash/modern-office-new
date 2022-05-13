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
    "/reports/admin/peak-days/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.peakDays
  );

  app.use(errors());
};
