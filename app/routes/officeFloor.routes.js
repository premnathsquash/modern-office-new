const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/admin/officeFloor.controller");

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
  app.patch(
    "/update/office",
    [authJwt.verifyToken, authJwt.isClient],
    controller.updateOffice
  );
  app.get(
    "/find/floor/:id",
    [authJwt.verifyToken, authJwt.isClient],
    controller.getFloor
  );
  app.patch(
    "/update/floor/:id",
    [authJwt.verifyToken, authJwt.isClient],
    controller.updateFloor
  );
  app.delete(
    "/delete/:id",
    [authJwt.verifyToken, authJwt.isClient],
    controller.deleteFloor
  )
  app.get(
    "/unreserved-seats",
    [authJwt.verifyToken, authJwt.isClient],
    controller.unreservedSeats
  );
  app.use(errors());
};
