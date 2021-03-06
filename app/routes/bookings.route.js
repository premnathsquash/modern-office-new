
const { errors } = require("celebrate");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/mobile/booking.controller");

module.exports = function (app) {
  app.post(
    "/booking/new",
    [authJwt.verifyToken, authJwt.isUser],
    controller.booking
  );

  app.get(
    "/bookings/invite-users",
    [authJwt.verifyToken, authJwt.isUser],
    controller.listUsers
  );

  app.get(
    "/bookings/mobile/history",
    [authJwt.verifyToken, authJwt.isUser],
    controller.bookingHist
  );
  
  app.use(errors());
};
