const { errors } = require("celebrate");
const ws = require("ws");

const wsServer = new ws.Server({ noServer: true });

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  wsServer.on("connection", (socket) => {
    socket.on("message", (message) => console.log(message));
  });

  const server = app.listen(3000);
  server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
      wsServer.emit("connection", socket, request);
    });
  });

  app.use(errors());
};
