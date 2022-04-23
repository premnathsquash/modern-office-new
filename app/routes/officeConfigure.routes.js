const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/admin/officeConfigure.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/officeconfigure",
    [authJwt.verifyToken, authJwt.isClient],
    controller.officeConfigureRead
  );
  app.patch(
    "/officeconfigure",
    [authJwt.verifyToken, authJwt.isClient],
    controller.officeConfigureUpdate
  );

  app.use(errors());
};
