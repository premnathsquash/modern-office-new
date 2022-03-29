const { errors } = require("celebrate");
const controller = require("../controllers/plans.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/payment/plans", controller.getplans);

  app.use(errors());
};
