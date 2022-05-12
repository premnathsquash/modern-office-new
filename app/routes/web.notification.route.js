module.exports = function (app) {
  app.ws("/echo", (ws, req) => {
    console.log("connection");
    ws.on("message", (msg) => {
      ws.send(msg);
    });
  });
};
