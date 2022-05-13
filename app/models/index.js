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
db.departments = require("./department.model");
db.officeConfigure = require("./officeConfigure.model");
db.attendance = require("./attendance.model");
db.vendor = require("./vendor.model");
db.promotion = require("./promotion.model");
db.booking = require("./booking.model");
db.leaderBoard = require("./leaderBoard.model");

db.ROLES = ["user", "admin", "client"];

module.exports = db;