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
    "/reports/client/list",
    [authJwt.verifyToken, authJwt.isClient],
    controller.list
  );

  app.get(
    "/reports/admin/list",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller1.list
  );

  app.use(errors());
};
