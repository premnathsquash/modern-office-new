const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.token = require("./token.model");
db.enquire = require("./enquire.model");
db.office = require("./office.model");
db.floor = require("./floor.model");
db.profile = require("./profile.model");
db.seats = require("./seats.model");

db.ROLES = ["user", "admin", "client"];

module.exports = db;