const { errors } = require("celebrate");
const controller = require("../controllers/admin/department.controller");
const { authJwt } = require("../middlewares");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/users/departments",
    [authJwt.verifyToken, authJwt.isClient],
    controller.createDepartment
  );
  app.get(
    "/users/departments",
    [authJwt.verifyToken, authJwt.isClient],
    controller.getAllDepartment
  );
  app.patch(
    "/users/departments",
    [authJwt.verifyToken, authJwt.isClient],
    controller.updateDepartment
  );
  app.delete(
    "/users/departments",
    [authJwt.verifyToken, authJwt.isClient],
    controller.deleteDepartment
  );

  app.use(errors());
};

