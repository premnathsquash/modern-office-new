const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/officeFloor.controller");

module.exports = function (app) {
  app.post(
    "/create/office",
    [authJwt.verifyToken, authJwt.isClient],
    controller.CreateOffice
  );
  app.get(
    "/list/offices",
    [authJwt.verifyToken, authJwt.isClient],
    controller.ListOffices
  );

  app.post(
    "/create/floor",
    [authJwt.verifyToken, authJwt.isClient],
    controller.CreateFloor
  );
  app.use(errors());
};
