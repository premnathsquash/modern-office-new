const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/officeFloor.controller");

module.exports = function (app) {
  app.get(
    "/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.test
  );

  app.use(errors());
};
