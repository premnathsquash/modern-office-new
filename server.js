const express = require("express");
const cors = require("cors");

const dbConfig = require("./app/config/db.config");
const db = require("./app/models");
const initial = require("./createRoles");
const PORT = process.env.PORT || 8080;

const app = express();

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  db.mongoose
    .connect(`${dbConfig.HOSTURL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
