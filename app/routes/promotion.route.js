const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/superadmin/promotion.controller");

module.exports = function (app) {
  app.post(
    "/promotions",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createPromotion
  );
  
  app.use(errors());
};
