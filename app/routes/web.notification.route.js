const { errors } = require("celebrate");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.ws("/echo", (ws, req) => {
    console.log("connection");
    ws.on("message", (msg) => {
      ws.send(msg);
    });
  });

  app.use(errors());
};
