const { errors } = require("celebrate");
const ws = require("ws");

const wsServer = new ws.Server({ port: 3000 });

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  wsServer.on("connection", socket=>{
    console.log("connection");
    
  })

  app.use(errors());
};
