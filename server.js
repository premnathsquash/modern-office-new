require("dotenv").config();
const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const { errors } = require("celebrate");
const dbConfig = require("./app/config/db.config");
const db = require("./app/models");
const initial = require("./createRoles");
const PORT = process.env.PORT || 8080;

const app = express();
expressWs(app);
var corsOptions = {
  origin: "*",
};
app.use(errors());
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

require("./app/routes/auth.routes")(app);
require("./app/routes/enquire.routes")(app);
require("./app/routes/plans.routes")(app);
require("./app/routes/webhooks.routes")(app);
require("./app/routes/officeFloor.routes")(app);
require("./app/routes/stripe.routes")(app);
require("./app/routes/department.routes")(app);
require("./app/routes/officeConfigure.routes")(app);
require("./app/routes/attendance.route")(app);
require("./app/routes/promotion.route")(app);
require("./app/routes/bookings.route")(app);
require("./app/routes/leaderboard.route")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/reedeem.routes")(app);
require("./app/routes/reports.route")(app);
require("./app/routes/web.notification.route")(app);
require("./app/routes/mobile.notification.route")(app);
require("./app/routes/notification.settings.routes")(app);
require("./app/routes/importexport.route")(app);
require("./app/routes/notification.route")(app);
//require("./app/routes/importexport.route")(app);

app.listen(PORT, () => {
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
