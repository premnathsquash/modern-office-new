require("dotenv").config();
const express = require("express");
const ws = require("ws");
const cors = require("cors");
const { errors } = require("celebrate");
const dbConfig = require("./app/config/db.config");
const db = require("./app/models");
const initial = require("./createRoles");
const PORT = process.env.PORT || 8080;

const server = express();

var corsOptions = {
  origin: "*",
};
server.use(errors());
server.use(cors(corsOptions));
server.use((req, res, next) => {
  if (req.originalUrl.startsWith("/webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
server.use(express.urlencoded({ extended: true }));

require("./app/routes/auth.routes")(server);
require("./app/routes/enquire.routes")(server);
require("./app/routes/plans.routes")(server);
require("./app/routes/webhooks.routes")(server);
require("./app/routes/officeFloor.routes")(server);
require("./app/routes/stripe.routes")(server);
require("./app/routes/department.routes")(server);
require("./app/routes/officeConfigure.routes")(server);
require("./app/routes/attendance.route")(server);
require("./app/routes/promotion.route")(server);
require("./app/routes/bookings.route")(server);
require("./app/routes/leaderboard.route")(server);
require("./app/routes/dashboard.routes")(server);
require("./app/routes/dashboard.routes")(server);
require("./app/routes/reedeem.routes")(server);
require("./app/routes/reports.route")(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  db.mongoose
    .connect(`${dbConfig.HOSTURL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("Successfully connect to MongoDB.");
      initial();
    })
    .catch((err) => {
      console.error("Connection error", err);
      process.exit();
    });
});

const wss = new ws.Server({ server });
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));
});
