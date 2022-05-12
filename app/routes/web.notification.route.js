const { errors } = require("celebrate");
const controller = require("../controllers/admin/notification.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.ws("/echo", controller.check);

  app.use(errors());
};
