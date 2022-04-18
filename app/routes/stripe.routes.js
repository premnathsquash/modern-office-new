const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/stripe.controller");

module.exports = function (app) {
  app.get("/cancel/subscription", [authJwt.verifyToken, authJwt.isClient || authJwt.isAdmin],
  controller.cancel)
  app.use(errors());
}