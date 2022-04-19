const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/stripe.controller");

module.exports = function (app) {
  app.get("/cancel/subscription", [authJwt.verifyToken, authJwt.isClient],
  controller.cancel);

  app.get("/retrive/subscription", [authJwt.verifyToken, authJwt.isClient],
  controller.retrive);

  app.post("/update/subscription", [authJwt.verifyToken, authJwt.isClient],
  controller.update);

  app.use(errors());
}